"use client";

export function PageHead({ eyebrow, title, subtitle, action, onAction }: { eyebrow?: string; title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return <div className="page-head">
    <div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h1>{title}</h1><p>{subtitle}</p></div>
    {action ? <button className="primary" onClick={onAction}>＋ {action}</button> : null}
  </div>;
}
