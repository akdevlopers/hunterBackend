"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Sparkles,
  ChevronDown,
  Palette,
} from "lucide-react";

export function RichTextEditor({
  label,
  value = "",
  onChange,
  placeholder = "Write description here...",
  minHeight = "120px",
}) {
  const [isCodeView, setIsCodeView] = useState(false);
  const editorRef = useRef(null);

  React.useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== (value || "")) {
          editorRef.current.innerHTML = value || "";
        }
      }
    }
  }, [value, isCodeView]);

  const formatDoc = (cmd, val = null) => {
    if (typeof document !== "undefined") {
      document.execCommand(cmd, false, val);
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontChange = (e) => {
    formatDoc("fontName", e.target.value);
  };

  const handleColorChange = (e) => {
    formatDoc("foreColor", e.target.value);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-800">
          {label}
        </label>
      )}

      {/* Editor Container matching Hunter/Meetay summernote style */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition">
        {/* Rich Text Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-700">
          {/* Magic / AI */}
          <button
            type="button"
            onClick={() => formatDoc("insertText", " • ")}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition"
            title="Magic Insert"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => formatDoc("bold")}
            className="p-1.5 rounded hover:bg-slate-200 font-bold transition text-xs"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("italic")}
            className="p-1.5 rounded hover:bg-slate-200 italic transition text-xs"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("underline")}
            className="p-1.5 rounded hover:bg-slate-200 underline transition text-xs"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("strikeThrough")}
            className="p-1.5 rounded hover:bg-slate-200 line-through transition text-xs"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Font Family Dropdown */}
          <select
            onChange={handleFontChange}
            defaultValue="sans-serif"
            className="bg-white border border-slate-200 text-[11px] rounded px-1.5 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="sans-serif">sans-serif</option>
            <option value="serif">serif</option>
            <option value="monospace">monospace</option>
            <option value="cursive">cursive</option>
          </select>

          {/* Color Picker */}
          <div className="relative flex items-center">
            <label
              htmlFor={`color-${label?.replace(/\s+/g, "-")}`}
              className="p-1.5 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-0.5 cursor-pointer text-slate-700"
              title="Font Color"
            >
              <span>A</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </label>
            <input
              id={`color-${label?.replace(/\s+/g, "-")}`}
              type="color"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              onChange={handleColorChange}
            />
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => formatDoc("insertUnorderedList")}
            className="p-1.5 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("insertOrderedList")}
            className="p-1.5 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Alignment */}
          <button
            type="button"
            onClick={() => formatDoc("justifyLeft")}
            className="p-1.5 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("justifyCenter")}
            className="p-1.5 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc("justifyRight")}
            className="p-1.5 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Code View Toggle */}
          <button
            type="button"
            onClick={() => setIsCodeView(!isCodeView)}
            className={`p-1.5 rounded transition text-xs font-mono cursor-pointer ${
              isCodeView ? "bg-emerald-100 text-emerald-700 font-bold" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Code View"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editor Body */}
        {isCodeView ? (
          <textarea
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{ minHeight }}
            className="w-full p-3 font-mono text-xs text-slate-100 bg-slate-900 focus:outline-none resize-y"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ minHeight }}
            className="p-3 text-xs text-slate-800 focus:outline-none overflow-y-auto leading-relaxed"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}

