import { useState, useEffect, useCallback } from "react";

let listeners = [];
let toasts = [];
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function dispatch(action) {
  if (action.type === "ADD") {
    toasts = [action.toast, ...toasts].slice(0, 3);
  } else if (action.type === "DISMISS") {
    toasts = toasts.map((t) =>
      t.id === action.id ? { ...t, open: false } : t
    );
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== action.id);
      listeners.forEach((l) => l([...toasts]));
    }, 300);
  }
  listeners.forEach((l) => l([...toasts]));
}

export function toast({ title, description, variant }) {
  const id = genId();
  dispatch({
    type: "ADD",
    toast: { id, title, description, variant, open: true },
  });
  setTimeout(() => dispatch({ type: "DISMISS", id }), 4000);
  return { id, dismiss: () => dispatch({ type: "DISMISS", id }) };
}

export function useToast() {
  const [state, setState] = useState([...toasts]);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  return {
    toasts: state,
    toast,
    dismiss: (id) => dispatch({ type: "DISMISS", id }),
  };
}