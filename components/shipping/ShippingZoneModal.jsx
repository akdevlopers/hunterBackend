"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  COUNTRIES_AND_STATES,
  ALL_COUNTRIES,
  detectCountryByIP,
} from "@/lib/locationData";

const AVAILABLE_SHIPPING_METHODS = [
  "Flat Rate",
  "Free shipping",
  "Local pickup",
];

export function ShippingZoneModal({ isOpen, onClose, onSave, editingItem }) {
  const [zoneName, setZoneName] = useState("");
  const [countryName, setCountryName] = useState("India");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [selectedMethods, setSelectedMethods] = useState(["Flat Rate"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Auto-detect country via IP on mount if creating new zone
  useEffect(() => {
    async function detect() {
      if (!editingItem && isOpen) {
        const detected = await detectCountryByIP();
        if (detected) {
          setCountryName(detected);
          const states = COUNTRIES_AND_STATES[detected] || ["All States"];
          setStateName(states.includes("Tamil Nadu") ? "Tamil Nadu" : states[1] || states[0]);
        }
      }
    }
    detect();
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (editingItem) {
      setZoneName(editingItem.zone_name || "");
      const matchedCountry = editingItem.country_id || "India";
      setCountryName(matchedCountry);
      setStateName(editingItem.state_id || "Tamil Nadu");

      if (editingItem.shipping_method) {
        const parsed = editingItem.shipping_method
          .split(",")
          .map((s) => s.trim().replace(/\s*\(.*?\)\s*/g, ""))
          .filter(Boolean);
        setSelectedMethods(parsed.length > 0 ? parsed : ["Flat Rate"]);
      } else {
        setSelectedMethods(["Flat Rate"]);
      }
    } else {
      setZoneName("");
      // Keep detected country or fallback to India
      const states = COUNTRIES_AND_STATES[countryName] || ["All States"];
      setStateName(states.includes("Tamil Nadu") ? "Tamil Nadu" : states[1] || states[0]);
      setSelectedMethods(["Flat Rate"]);
    }
  }, [editingItem, isOpen]);

  // When Country changes, update available states
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setCountryName(newCountry);
    const states = COUNTRIES_AND_STATES[newCountry] || ["All States"];
    setStateName(states[1] || states[0] || "All States");
  };

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMethod = (method) => {
    if (!selectedMethods.includes(method)) {
      setSelectedMethods([...selectedMethods, method]);
    }
    setIsDropdownOpen(false);
  };

  const handleRemoveMethod = (method, e) => {
    e.stopPropagation();
    setSelectedMethods(selectedMethods.filter((m) => m !== method));
  };

  const unselectedMethods = AVAILABLE_SHIPPING_METHODS.filter(
    (m) => !selectedMethods.includes(m)
  );

  const availableStates = COUNTRIES_AND_STATES[countryName] || [
    "Select State",
    "All States",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    onSave({
      zone_name: zoneName.trim(),
      country_id: countryName,
      state_id: stateName === "Select State" ? "All States" : stateName,
      shipping_method: selectedMethods.join(", "),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Shipping Zone" : "Add Shipping Zone"}
      size="md"
      overflowVisible={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* 1. Name */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-800">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* 2. Country Name */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-800">
            Country Name
          </label>
          <div className="relative">
            <select
              value={countryName}
              onChange={handleCountryChange}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs pr-8 font-medium"
            >
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 3. State */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-800">
            State
          </label>
          <div className="relative">
            <select
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs pr-8 font-medium"
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 4. Shipping Method Tag Multi-Select matching screenshot */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block font-semibold text-slate-800">
            Shipping Method <span className="text-rose-500">*</span>
          </label>

          {/* Green-Bordered Tag Input Container */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="min-h-[44px] p-1.5 bg-white border border-emerald-600 ring-1 ring-emerald-500 rounded-lg flex flex-wrap items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {/* Selected Green Pill Badges */}
            {selectedMethods.map((method) => (
              <span
                key={method}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 text-white font-semibold text-xs shadow-2xs transition"
              >
                <span>{method}</span>
                <span className="opacity-60 font-light">|</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveMethod(method, e)}
                  className="hover:text-rose-200 transition cursor-pointer"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {/* Placeholder */}
            {selectedMethods.length === 0 && (
              <span className="text-xs text-slate-400 font-normal px-2 select-none">
                Please Select
              </span>
            )}
          </div>

          {/* Dropdown Options List */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              {unselectedMethods.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs font-medium">
                  All shipping methods selected.
                </div>
              ) : (
                unselectedMethods.map((method) => (
                  <div
                    key={method}
                    onClick={() => handleAddMethod(method)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer transition group"
                  >
                    <span>{method}</span>
                    <span className="text-[11px] text-slate-400 font-normal group-hover:text-slate-600 transition">
                      Press to select
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Buttons matching Meetay */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            {editingItem ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
