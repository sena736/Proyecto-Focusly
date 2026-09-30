import React, { useEffect, useState } from "react";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import { formatDueDateForInput } from "../../../utils/date";
import "./TaskForm.css";

const EMPTY_TASK_DATA = {};

const TaskForm = ({
  initialData = EMPTY_TASK_DATA,
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Crear tarea",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "PENDING",
  });

  const [errors, setErrors] = useState({});

  // =========================================
  // CARGAR DATOS PARA EDITAR
  // =========================================

  useEffect(() => {
    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      dueDate: formatDueDateForInput(initialData.dueDate),
      priority: initialData.priority || "MEDIUM",
      status: initialData.status || "PENDING",
    });
  }, [
    initialData.title,
    initialData.description,
    initialData.dueDate,
    initialData.priority,
    initialData.status,
  ]);

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
      onSubmit({
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      });
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

      <Input
        label="Título de la tarea"
        id="task-title"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        placeholder="Ej: Estudiar Matemáticas"
        maxLength={100}
        error={errors.title}
        showRequiredMark
      />

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

      <Input
        label="Fecha de entrega"
        id="task-due-date"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        error={errors.dueDate}
        showRequiredMark
      />

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
          <option value="LOW">Baja</option>

          <option value="MEDIUM">Media</option>

          <option value="HIGH">Alta</option>
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
          <option value="PENDING">Pendiente</option>

          <option value="COMPLETED">Completada</option>
        </select>
      </div>

      {/* =====================================
          BOTONES
          ===================================== */}

      <div className="task-form__actions">
        <Button
          variant="secondary"
          className="task-form__cancel"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="task-form__submit"
          loading={loading}
          loadingText="Guardando..."
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
