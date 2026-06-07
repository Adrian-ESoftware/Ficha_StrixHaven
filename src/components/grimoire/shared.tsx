import { useState } from 'react';

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-primary text-2xl font-bold tracking-widest uppercase">{children}</h2>;
}

export function Divider() {
  return (
    <div className="flex items-center justify-center w-full my-4 opacity-70">
      <div className="flex-1 h-[1px] bg-primary" />
      <div className="w-1.5 h-1.5 rotate-45 bg-primary mx-3" />
      <div className="flex-1 h-[1px] bg-primary" />
    </div>
  );
}

export function InputLine({ value, onChange, placeholder, className = "", label, center = false }: any) {
  return (
    <div className={`flex flex-col min-w-0 ${className}`}>
      {label && <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 truncate">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full min-w-0 bg-transparent border-b border-primary/30 text-foreground font-sans focus:outline-none focus:border-primary focus:shadow-[0_2px_8px_-2px_rgba(233,193,118,0.3)] transition-all pb-1 ${center ? 'text-center' : ''}`}
      />
    </div>
  );
}

export function Diamond({ checked, onChange, className = "", isCrimson = false }: any) {
  const colorClass = isCrimson ? "border-destructive bg-destructive" : "border-primary bg-primary shadow-[0_0_8px_rgba(233,193,118,0.5)]";
  const crimsonShadow = isCrimson ? "shadow-[0_0_8px_rgba(255,180,172,0.5)]" : "";
  const finalCheckedClass = isCrimson ? `${colorClass} ${crimsonShadow}` : colorClass;
  const emptyClass = isCrimson ? "border-destructive/50" : "border-primary/50";
  
  return (
    <button
      onClick={() => onChange && onChange(!checked)}
      className={`w-3.5 h-3.5 rotate-45 border transition-all duration-300 ${checked ? finalCheckedClass : emptyClass + ' bg-transparent'} ${className}`}
    />
  );
}

export function Circle({ checked, onChange, size = 4, className = "" }: any) {
  return (
    <button
      onClick={() => onChange && onChange(!checked)}
      className={`rounded-full border border-primary transition-all duration-300 ${checked ? 'bg-primary shadow-[0_0_8px_rgba(233,193,118,0.5)]' : 'bg-transparent border-primary/50'} ${className}`}
      style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
    />
  );
}

export function StatShield({ label, subLabels, value, onChange }: any) {
  return (
    <div className="flex flex-col items-center group relative">
      <div className="text-primary font-mono text-[11px] font-bold tracking-widest uppercase mb-2">{label}</div>
      
      <div className="relative w-20 h-24 bg-card border border-primary/30 clip-pentagon flex items-center justify-center group-hover:border-primary transition-colors overflow-hidden">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center bg-transparent text-foreground font-mono text-4xl font-bold focus:outline-none z-10"
        />
      </div>
      
      <div className="mt-3 flex flex-col items-center gap-0.5">
        {subLabels.map((sub: string, i: number) => (
          <div key={i} className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider">{sub}</div>
        ))}
      </div>
    </div>
  );
}
