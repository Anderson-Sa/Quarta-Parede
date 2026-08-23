"use client";

import { useActionState, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import {
  DESTAQUES_LAYOUT_OPTIONS,
  FONT_OPTIONS,
  type DestaquesLayoutValue,
  type FontFamilyValue,
  type HomeSection,
  type HomeSectionId,
} from "@/lib/homeSections";
import { updateAppearanceSettings, type AppearanceFormState } from "./actions";

const SECTION_LABELS: Record<HomeSectionId, string> = {
  destaques: "Destaques",
  outros: "Outros posts",
  ultimas: "Últimas",
};

const FONT_STACK: Record<FontFamilyValue, string> = {
  geist: "var(--font-geist-sans), sans-serif",
  inter: "var(--font-inter), sans-serif",
  poppins: "var(--font-poppins), sans-serif",
  roboto: "var(--font-roboto), sans-serif",
};

const labelClass = "mb-1.5 block text-sm font-medium text-foreground/70";
const inputClass =
  "w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-surface-border bg-background p-1"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          className={`${inputClass} font-mono uppercase`}
        />
      </div>
    </div>
  );
}

function SortableSectionRow({ section, onToggle }: { section: HomeSection; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-md border border-surface-border bg-background px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-foreground/40 hover:text-foreground/70"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className={`text-sm ${section.visible ? "text-foreground" : "text-foreground/40"}`}>
          {SECTION_LABELS[section.id]}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        title={section.visible ? "Ocultar seção" : "Mostrar seção"}
        aria-label={section.visible ? "Ocultar seção" : "Mostrar seção"}
        className="rounded-md p-1.5 text-foreground/50 hover:text-brand"
      >
        {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Small CSS-only mockup illustrating the shape of each Destaques layout option. */
function DestaquesLayoutThumb({ layout }: { layout: DestaquesLayoutValue }) {
  if (layout === "duplo") {
    return (
      <div className="flex h-14 gap-1">
        <div className="flex-1 rounded bg-foreground/20" />
        <div className="flex-1 rounded bg-foreground/20" />
      </div>
    );
  }
  if (layout === "lista") {
    return (
      <div className="flex h-14 flex-col justify-between gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-1/3 items-center gap-1">
            <div className="h-full w-6 shrink-0 rounded bg-foreground/20" />
            <div className="h-1.5 flex-1 rounded bg-foreground/20" />
          </div>
        ))}
      </div>
    );
  }
  if (layout === "carrossel") {
    return (
      <div className="flex h-14 gap-1 overflow-hidden">
        <div className="h-full w-1/3 shrink-0 rounded bg-foreground/20" />
        <div className="h-full w-1/3 shrink-0 rounded bg-foreground/20" />
        <div className="h-full w-1/3 shrink-0 rounded bg-foreground/10" />
      </div>
    );
  }
  return (
    <div className="flex h-14 gap-1">
      <div className="w-1/2 rounded bg-foreground/20" />
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-foreground/20" />
        ))}
      </div>
    </div>
  );
}

export function AppearanceForm({
  settings,
}: {
  settings: {
    brandColor: string;
    accentColor: string;
    fontFamily: FontFamilyValue;
    homeSections: HomeSection[];
    destaquesLayout: DestaquesLayoutValue;
  };
}) {
  const [state, formAction, pending] = useActionState<AppearanceFormState, FormData>(
    updateAppearanceSettings,
    undefined,
  );
  const [brandColor, setBrandColor] = useState(settings.brandColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [fontFamily, setFontFamily] = useState<FontFamilyValue>(settings.fontFamily);
  const [sections, setSections] = useState<HomeSection[]>(settings.homeSections);
  const [destaquesLayout, setDestaquesLayout] = useState<DestaquesLayoutValue>(
    settings.destaquesLayout,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggleSection(id: HomeSectionId) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Cores
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField label="Cor de marca" value={brandColor} onChange={setBrandColor} />
            <ColorField label="Cor de destaque" value={accentColor} onChange={setAccentColor} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Tipografia
          </h2>
          <select
            value={fontFamily}
            onChange={(event) => setFontFamily(event.target.value as FontFamilyValue)}
            className={inputClass}
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Layout de Destaques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DESTAQUES_LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDestaquesLayout(option.value)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  destaquesLayout === option.value
                    ? "border-brand bg-brand/10"
                    : "border-surface-border hover:border-brand/50"
                }`}
              >
                <DestaquesLayoutThumb layout={option.value} />
                <p className="mt-2 text-xs font-medium text-foreground/70">{option.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Seções da página inicial
          </h2>
          <p className="mb-3 text-xs text-foreground/40">
            Arraste para reordenar. Use o ícone de olho para mostrar ou ocultar uma seção.
          </p>
          <DndContext
            id="home-sections"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionRow
                    key={section.id}
                    section={section}
                    onToggle={() => toggleSection(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-400">Aparência salva.</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>

        <input type="hidden" name="brandColor" value={brandColor} readOnly />
        <input type="hidden" name="accentColor" value={accentColor} readOnly />
        <input type="hidden" name="fontFamily" value={fontFamily} readOnly />
        <input type="hidden" name="homeSectionOrder" value={JSON.stringify(sections)} readOnly />
        <input type="hidden" name="destaquesLayout" value={destaquesLayout} readOnly />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Preview</h2>
        <div
          className="space-y-4 rounded-lg border border-surface-border bg-background p-5"
          style={{ fontFamily: FONT_STACK[fontFamily] }}
        >
          <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: brandColor }}>
            Destaques
          </h3>
          <p className="text-sm text-foreground/70">
            Assim ficam o título e os textos do site com a fonte escolhida.
          </p>
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: brandColor }}
          >
            Botão de ação
          </button>
          <p className="text-sm" style={{ color: accentColor }}>
            Link ou destaque secundário
          </p>
        </div>
      </div>
    </form>
  );
}
