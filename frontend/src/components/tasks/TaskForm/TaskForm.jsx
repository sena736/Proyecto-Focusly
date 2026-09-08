import React, { useEffect, useState } from "react";
import "./TaskForm.css";

const TaskForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Crear tarea",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "media",
    status: "pendiente",
  });

  const [errors, setErrors] = useState({});

  // =========================================
  // CARGAR DATOS PARA EDITAR
  // =========================================

  useEffect(() => {
    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      dueDate: initialData.dueDate || "",
      priority: initialData.priority || "media",
      status: initialData.status || "pendiente",
    });
  }, [initialData]);

  // =========================================
  // MANEJAR CAMBIOS
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Eliminar error cuando el usuario corrige el campo
    if (errors[name]) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }
  };

  // =========================================
  // VALIDACIÓN
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título de la tarea es obligatorio.";
    }

    if (formData.title.trim().length > 100) {
      newErrors.title = "El título no puede superar los 100 caracteres.";
    }

    if (formData.description.length > 500) {
      newErrors.description =
        "La descripción no puede superar los 500 caracteres.";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Selecciona una fecha.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // ENVIAR FORMULARIO
  // =========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // =========================================
  // CANCELAR
  // =========================================

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {/* =====================================
          TÍTULO
          ===================================== */}

      <div className="task-form__field">
        <label htmlFor="task-title">
          Título de la tarea
          <span className="task-form__required">*</span>
        </label>

        <input
          id="task-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Estudiar Matemáticas"
          maxLength={100}
          className={errors.title ? "task-form__input--error" : ""}
        />

        {errors.title && (
          <span className="task-form__error">{errors.title}</span>
        )}
      </div>

      {/* =====================================
          DESCRIPCIÓN
          ===================================== */}

      <div className="task-form__field">
        <label htmlFor="task-description">Descripción</label>

        <textarea
          id="task-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe brevemente la tarea..."
          rows="4"
          maxLength={500}
          className={errors.description ? "task-form__input--error" : ""}
        />

        <div className="task-form__counter">
          {formData.description.length}/500
        </div>

        {errors.description && (
          <span className="task-form__error">{errors.description}</span>
        )}
      </div>

      {/* =====================================
          FECHA
          ===================================== */}

      <div className="task-form__field">
        <label htmlFor="task-due-date">
          Fecha de entrega
          <span className="task-form__required">*</span>
        </label>

        <input
          id="task-due-date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          className={errors.dueDate ? "task-form__input--error" : ""}
        />

        {errors.dueDate && (
          <span className="task-form__error">{errors.dueDate}</span>
        )}
      </div>

      {/* =====================================
          PRIORIDAD
          ===================================== */}

      <div className="task-form__field">
        <label htmlFor="task-priority">Prioridad</label>

        <select
          id="task-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="baja">Baja</option>

          <option value="media">Media</option>

          <option value="alta">Alta</option>
        </select>
      </div>

      {/* =====================================
          ESTADO
          ===================================== */}

      <div className="task-form__field">
        <label htmlFor="task-status">Estado</label>

        <select
          id="task-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pendiente">Pendiente</option>

          <option value="completada">Completada</option>
        </select>
      </div>

      {/* =====================================
          BOTONES
          ===================================== */}

      <div className="task-form__actions">
        <button
          type="button"
          className="task-form__cancel"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </button>

        <button type="submit" className="task-form__submit" disabled={loading}>
          {loading ? (
            <>
              <span className="task-form__spinner"></span>
              Guardando...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
