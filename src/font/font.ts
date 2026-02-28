import { Geist, Geist_Mono, Instrument_Serif, Actor, Orbitron } from "next/font/google";

export const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
    weight: ["300", "400", "500", "600"],
});

export const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    weight: ["400", "500"],
});

export const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    variable: "--font-instrument-serif",
    weight: ["400"],
    style: ["normal", "italic"],
});


export const orbitron = Orbitron({
    subsets: ["latin"],
    variable: "--font-orbitron",
    weight: ["400"],
});