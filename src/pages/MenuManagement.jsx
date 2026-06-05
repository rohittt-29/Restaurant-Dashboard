/**
 * MenuManagement.jsx — CRUD interface for restaurant menu items
 *
 * FEATURES:
 * - List all menu items (name, price, availability toggle)
 * - Add new item via modal form
 * - Edit existing item inline (name and price)
 * - Delete item with confirmation prompt
 * - Toggle available/unavailable instantly
 *
 * WHY MODAL FOR ADD/EDIT:
 * Modals keep the user on the same page — no navigation needed.
 * The menu list stays visible behind the modal for context.
 * This is better than a separate "add item" page for a small form.
 */

import { useState, useEffect } from 'react';
import {
  fetchMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// The initial/empty state for the form — used both for Add and Edit modes
const EMPTY_FORM = { name: '', price: '' };

const MenuManagement = () => {
  // Full list of menu items from the backend
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal visibility and which mode we're in (add vs edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Add mode, item object = Edit mode

  // Form input values — controlled inputs are easier to validate and reset
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Track which item is being saved/deleted to show loading state on that specific item
  const [savingItemId, setSavingItemId] = useState(null);

  // Fetch all menu items from GET /menu when the page loads
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMenu();
      setMenuItems(data);
    } catch (err) {
      setError('Failed to load menu. Is the backend running?');
      console.error('Menu fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Opens the modal in ADD mode — empty form, no editing item
  const openAddModal = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  // Opens the modal in EDIT mode — pre-fills form with existing item data
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: String(item.price) });
    setFormError('');
    setIsModalOpen(true);
  };

  // Closes the modal and resets form state completely
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  // Handles both Add and Edit form submissions
  const handleFormSubmit = async (event) => {
    // Prevent browser's default form submission (which would reload the page)
    event.preventDefault();

    // Client-side validation — catch obvious errors before hitting the backend
    const trimmedName = formData.name.trim();
    const parsedPrice = parseFloat(formData.price);

    if (!trimmedName) {
      setFormError('Please enter an item name.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    const itemPayload = { name: trimmedName, price: parsedPrice };

    try {
      setSavingItemId('form'); // Show loading state on submit button

      if (editingItem) {
        // EDIT MODE: update existing item
        const updatedItem = await updateMenuItem(editingItem._id, itemPayload);
        // Replace the old item in the list without re-fetching everything
        setMenuItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? updatedItem : item))
        );
      } else {
        // ADD MODE: create new item
        const newItem = await addMenuItem({ ...itemPayload, available: true });
        // Append to end of list
        setMenuItems((prev) => [...prev, newItem]);
      }

      closeModal(); // Close modal on success
    } catch (err) {
      setFormError('Failed to save item. Please try again.');
      console.error('Menu save error:', err);
    } finally {
      setSavingItemId(null);
    }
  };

  /**
   * toggleAvailability — Flips the available flag for a menu item
   *
   * WHY OPTIMISTIC UPDATE:
   * The toggle switch should feel instant.
   * We flip the UI immediately, then sync with the backend.
   * If it fails, we flip back and show an alert.
   */
  const toggleAvailability = async (item) => {
    const newAvailability = !item.available;

    // Immediately update the toggle in the UI
    setMenuItems((prev) =>
      prev.map((m) =>
        m._id === item._id ? { ...m, available: newAvailability } : m
      )
    );

    try {
      await updateMenuItem(item._id, { available: newAvailability });
    } catch (err) {
      // Revert the toggle if the backend call failed
      setMenuItems((prev) =>
        prev.map((m) =>
          m._id === item._id ? { ...m, available: item.available } : m
        )
      );
      alert('Failed to update availability. Please try again.');
      console.error('Toggle availability error:', err);
    }
  };

  // Deletes an item after confirmation — irreversible action requires confirmation
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" from the menu? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setSavingItemId(item._id); // Show loading on this specific item's delete button
      await deleteMenuItem(item._id);
      // Remove from list without re-fetching
      setMenuItems((prev) => prev.filter((m) => m._id !== item._id));
    } catch (err) {
      alert('Failed to delete item. Please try again.');
      console.error('Delete menu item error:', err);
    } finally {
      setSavingItemId(null);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading menu..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Menu Management</h2>
          <p className="page-subtitle">{menuItems.length} items on menu</p>
        </div>
        {/* Add Item button opens the modal in Add mode */}
        <button className="btn btn--primary" onClick={openAddModal} id="add-menu-item-btn">
          + Add Item
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn btn--outline" onClick={loadMenu}>Retry</button>
        </div>
      )}

      {/* MENU ITEMS LIST */}
      {menuItems.length === 0 && !error ? (
        <EmptyState
          icon="🍽️"
          title="Menu is empty"
          message="Add your first menu item to get started."
        />
      ) : (
        <div className="menu-list">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className={`menu-item ${!item.available ? 'menu-item--unavailable' : ''}`}
            >
              {/* Item info section */}
              <div className="menu-item__info">
                <h3 className="menu-item__name">{item.name}</h3>
                <span className="menu-item__price">₹{Number(item.price).toFixed(2)}</span>
              </div>

              {/* Actions: availability toggle + edit + delete */}
              <div className="menu-item__actions">
                {/* Toggle switch for availability — visually shows on/off state */}
                <label className="toggle" aria-label={`${item.available ? 'Disable' : 'Enable'} ${item.name}`}>
                  <input
                    type="checkbox"
                    className="toggle__input"
                    checked={item.available}
                    onChange={() => toggleAvailability(item)}
                  />
                  <span className="toggle__slider" />
                  <span className="toggle__label">
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </label>

                {/* Edit button */}
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => openEditModal(item)}
                  aria-label={`Edit ${item.name}`}
                >
                  ✏️ Edit
                </button>

                {/* Delete button — shows loading state while deleting */}
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(item)}
                  disabled={savingItemId === item._id}
                  aria-label={`Delete ${item.name}`}
                >
                  {savingItemId === item._id ? '...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        // Clicking the backdrop (outside the modal card) closes the modal
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div
            className="modal"
            // stopPropagation prevents clicks INSIDE the modal from closing it
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">
                {editingItem ? `Edit "${editingItem.name}"` : 'Add New Item'}
              </h3>
              <button className="modal__close" onClick={closeModal} aria-label="Close modal">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="modal__body">
                {/* Item name input */}
                <div className="form-group">
                  <label htmlFor="item-name" className="form-label">Item Name</label>
                  <input
                    id="item-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Chicken Biryani"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Price input */}
                <div className="form-group">
                  <label htmlFor="item-price" className="form-label">Price (₹)</label>
                  <input
                    id="item-price"
                    type="number"
                    className="form-input"
                    placeholder="e.g., 180"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                {/* Validation error message */}
                {formError && <p className="form-error">{formError}</p>}
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={savingItemId === 'form'}
                >
                  {savingItemId === 'form'
                    ? 'Saving...'
                    : editingItem
                    ? 'Save Changes'
                    : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
