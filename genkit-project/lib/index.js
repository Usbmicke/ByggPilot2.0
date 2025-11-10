"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSuggestion = exports.menuSuggestionFlow = void 0;
const core_1 = require("@genkit-ai/core");
const firebase_1 = require("@genkit-ai/firebase");
const flow_1 = require("@genkit-ai/flow");
const functions_1 = require("@genkit-ai/firebase/functions");
const z = __importStar(require("zod"));
// Konfigurera Genkit för att använda Firebase-pluginet
(0, core_1.configureGenkit)({
    plugins: [
        (0, firebase_1.firebase)(), // Initierar Firebase med standardinställningar
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});
// Definiera vårt "menuSuggestion"-flöde
exports.menuSuggestionFlow = (0, flow_1.defineFlow)({
    name: 'menuSuggestionFlow',
    inputSchema: z.string(), // Vi förväntar oss en sträng som input
    outputSchema: z.string(), // Vi kommer att returnera en sträng som output
}, async (name) => {
    // Detta är logiken för flödet
    return `Hello, ${name}! Hälsningar från en säker och stabil Genkit-backend.`;
});
// Exponera flödet som en anropbar funktion för vår frontend
exports.menuSuggestion = (0, functions_1.onCallGenkit)({
    name: 'menuSuggestion', // Namnet vi anropar från frontend
    flow: exports.menuSuggestionFlow, // Flödet som ska köras
    // Autentisering hanteras automatiskt av onCallGenkit
});
