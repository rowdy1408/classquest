import React from 'react';

const glyphs = {
  X: '×', Clock: '◷', Plus: '+', Trash2: '⌫', Check: '✓', Crown: '♛', Lock: '🔒', Play: '▶', Swords: '⚔',
  LogOut: '↪', RotateCcw: '↻', ArrowRight: '→', ArrowUp: '↑', GraduationCap: '🎓', ShieldCheck: '🛡', Sparkles: '✦',
  Mail: '✉', KeyRound: '🔑', ArrowLeft: '←', UserRound: '●', CalendarDays: '▦', CheckCircle2: '✓',
  Coins: '◉', School: '🏫', ScrollText: '▤', ShieldAlert: '⚠', Users: '👥', ChevronRight: '›', Edit3: '✎',
  Save: '▣', Power: '⏻', ShoppingBag: '🛍', PackageOpen: '◫', CircleUserRound: '◉', Home: '⌂', BookOpenCheck: '▥',
  Upload: '⇧', HelpCircle: '?', Download: '⇩', FileSpreadsheet: '▦', Settings: '⚙'
};

function makeIcon(name) {
  return function Icon({ size = 20, className = '', ...props }) {
    return <span aria-hidden="true" className={`local-icon ${className}`} style={{ width: size, height: size, fontSize: Math.max(12, size * 0.82) }} {...props}>{glyphs[name] || '•'}</span>;
  };
}

export const X = makeIcon('X');
export const Clock = makeIcon('Clock');
export const Plus = makeIcon('Plus');
export const Trash2 = makeIcon('Trash2');
export const Check = makeIcon('Check');
export const Crown = makeIcon('Crown');
export const Lock = makeIcon('Lock');
export const Play = makeIcon('Play');
export const Swords = makeIcon('Swords');
export const LogOut = makeIcon('LogOut');
export const RotateCcw = makeIcon('RotateCcw');
export const ArrowRight = makeIcon('ArrowRight');
export const ArrowUp = makeIcon('ArrowUp');
export const GraduationCap = makeIcon('GraduationCap');
export const ShieldCheck = makeIcon('ShieldCheck');
export const Sparkles = makeIcon('Sparkles');
export const Mail = makeIcon('Mail');
export const KeyRound = makeIcon('KeyRound');
export const ArrowLeft = makeIcon('ArrowLeft');
export const UserRound = makeIcon('UserRound');
export const CalendarDays = makeIcon('CalendarDays');
export const CheckCircle2 = makeIcon('CheckCircle2');
export const Coins = makeIcon('Coins');
export const School = makeIcon('School');
export const ScrollText = makeIcon('ScrollText');
export const ShieldAlert = makeIcon('ShieldAlert');
export const Users = makeIcon('Users');
export const ChevronRight = makeIcon('ChevronRight');
export const Edit3 = makeIcon('Edit3');
export const Save = makeIcon('Save');
export const Power = makeIcon('Power');
export const ShoppingBag = makeIcon('ShoppingBag');
export const PackageOpen = makeIcon('PackageOpen');
export const CircleUserRound = makeIcon('CircleUserRound');
export const Home = makeIcon('Home');
export const BookOpenCheck = makeIcon('BookOpenCheck');
export const Upload = makeIcon('Upload');
export const HelpCircle = makeIcon('HelpCircle');
export const Download = makeIcon('Download');
export const FileSpreadsheet = makeIcon('FileSpreadsheet');
export const Settings = makeIcon('Settings');
