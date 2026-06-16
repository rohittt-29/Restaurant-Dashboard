/**
 * MenuManagement.jsx — CRUD interface for restaurant menu items
 *
 * Redesigned: 2-column card grid, unavailable items greyed out,
 * dark "+ Add Item" button top right, no emojis.
 * All functionality identical to original.
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

const EMPTY_FORM = { name: '', price: '' };

// SVG Icons — no emojis
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,4 13,4" />
    <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
    <rect x="4" y="4" width="8" height="10" rx="1" />
    <line x1="6" y1="7" x2="6" y2="11" />
    <line x1="10" y1="7" x2="10" y2="11" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const MenuEmptyIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="16" height="16" rx="2" />
    <line x1="8" y1="8" x2="14" y2="8" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="8" y1="14" x2="11" y2="14" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <line x1="11" y1="7" x2="11" y2="11.5" />
    <circle cx="11" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [savingItemId, setSavingItemId] = useState(null);

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

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: String(item.price) });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

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
      setSavingItemId('form');

      if (editingItem) {
        const updatedItem = await updateMenuItem(editingItem._id, itemPayload);
        setMenuItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? updatedItem : item))
        );
      } else {
        const newItem = await addMenuItem({ ...itemPayload, available: true });
        setMenuItems((prev) => [...prev, newItem]);
      }

      closeModal();
    } catch (err) {
      setFormError('Failed to save item. Please try again.');
      console.error('Menu save error:', err);
    } finally {
      setSavingItemId(null);
    }
  };

  const toggleAvailability = async (item) => {
    const newAvailability = !item.available;

    setMenuItems((prev) =>
      prev.map((m) =>
        m._id === item._id ? { ...m, available: newAvailability } : m
      )
    );

    try {
      await updateMenuItem(item._id, { available: newAvailability });
    } catch (err) {
      setMenuItems((prev) =>
        prev.map((m) =>
          m._id === item._id ? { ...m, available: item.available } : m
        )
      );
      alert('Failed to update availability. Please try again.');
      console.error('Toggle availability error:', err);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" from the menu? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setSavingItemId(item._id);
      await deleteMenuItem(item._id);
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
        {/* Add Item button — dark colored, top right */}
        <button className="btn btn--primary" onClick={openAddModal} id="add-menu-item-btn">
          <PlusIcon />
          Add Item
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-banner__icon"><AlertIcon /></span>
          <p>{error}</p>
          <button className="btn btn--outline" onClick={loadMenu}>Retry</button>
        </div>
      )}

      {/* MENU ITEMS GRID — 2 columns */}
      {menuItems.length === 0 && !error ? (
        <EmptyState
          icon={<MenuEmptyIcon />}
          title="Menu is empty"
          message="Add your first menu item to get started."
        />
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className={`menu-item ${!item.available ? 'menu-item--unavailable' : ''}`}
            >
              {/* Top: name, price, unavailable tag */}
              <div className="menu-item__header">
                <div className="menu-item__info">
                  <h3 className="menu-item__name">{item.name}</h3>
                  <span className="menu-item__price">₹{Number(item.price).toFixed(2)}</span>
                </div>
                {!item.available && (
                  <span className="menu-item__unavail-tag">Unavailable</span>
                )}
              </div>

              {/* Bottom: toggle + action buttons */}
              <div className="menu-item__actions">
                <label className="toggle" aria-label={`${item.available ? 'Disable' : 'Enable'} ${item.name}`}>
                  <input
                    type="checkbox"
                    className="toggle__input"
                    checked={item.available}
                    onChange={() => toggleAvailability(item)}
                  />
                  <span className="toggle__slider" />
                  <span className="toggle__label">
                    {item.available ? 'Available' : 'Off'}
                  </span>
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => openEditModal(item)}
                    aria-label={`Edit ${item.name}`}
                  >
                    <EditIcon />
                    Edit
                  </button>

                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDelete(item)}
                    disabled={savingItemId === item._id}
                    aria-label={`Delete ${item.name}`}
                  >
                    <TrashIcon />
                    {savingItemId === item._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">
                {editingItem ? `Edit "${editingItem.name}"` : 'Add New Item'}
              </h3>
              <button className="modal__close" onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="modal__body">
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
