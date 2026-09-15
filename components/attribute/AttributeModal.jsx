"use client";

import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AttributeModal({ isOpen, onClose, onSave, attribute = null }) {
  const isEditing = !!attribute;

  const [formData, setFormData] = useState({
    name: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name || "",
      });
    } else {
      setFormData({
        name: "",
      });
    }
    setError("");
  }, [attribute, isOpen]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData({
      name: val,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Attribute name is required.");
      return;
    }

    onSave({
      name: formData.name,
      id: attribute?.id,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Attribute" : "Add Attribute"}
      description="Define a product attribute (e.g. Size, Color, Material) to generate product variations."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Attribute Name Field */}
        <Input
          label="Attribute Name *"
          placeholder="e.g. Size or Color"
          value={formData.name}
          onChange={handleNameChange}
          error={error}
        />

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            {isEditing ? "Update Attribute" : "Create Attribute"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

