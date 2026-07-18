import React from 'react';
import { Palette, Link2, Key, Cpu, SlidersHorizontal, Shield, Database, Globe, Users, Calendar, BarChart3 } from 'lucide-react';

const iconMap = {
  branding: Palette,
  footer: Link2,
  api: Key,
  ollama: Cpu,
  preferences: SlidersHorizontal,
  security: Shield,
  data: Database,
  language: Globe,
  collab: Users,
  calendar: Calendar,
  analytics: BarChart3,
};

export default function SettingsNav({ sections, active, onChange }) {
  return (
    <nav className="flex flex-col gap-1" dir="rtl">
      {sections.map((section) => {
        const Icon = iconMap[section.id] || SlidersHorizontal;
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            onClick={() => onChange(section.id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-right transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}