// src/scripts/dashboard-client.ts

import { onMount } from "solid-js";

let venuesContainer: HTMLElement;
let noteInput: HTMLTextAreaElement;
let saveNoteBtn: HTMLButtonElement;
let modalStatus: HTMLElement;
let logoutButton!: HTMLElement;
let currentVenueId: string | null = null;

// Fetch and render properties
async function fetchAndRenderVenues() {
    try {
        const res = await fetch("/api/venues", {
            credentials: "include",  // Add credentials to send cookies
        });
        if (!res.ok) throw new Error("Failed to fetch venues: " + res.status);
        const data = await res.json();
        venuesContainer.innerHTML = data
            .map(
                (v: any) => `
        <div class="venue-card" data-id="${v.id}">
          <h3 class="font-bold">${v.name}</h3>
          <button class="recommend-btn mt-2 px-4 py-2 bg-blue-600 text-white rounded">Recommend</button>
        </div>`
            )
            .join("");

        // Wire up buttons
        document.querySelectorAll(".recommend-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const card = (e.currentTarget as HTMLElement).closest(".venue-card");
                if (!card) return;
                currentVenueId = card.getAttribute("data-id");
                openModal();
            });
        });
    } catch (err) {
        console.error(err);
        venuesContainer.textContent = "Error loading properties.";
    }
}

function openModal() {
    const modal = document.getElementById("generateLinkModal")!;
    modalStatus.textContent = "";
    noteInput.value = "";
    saveNoteBtn.disabled = false;
    saveNoteBtn.textContent = "Save Note";
    modal.classList.remove("hidden");
    noteInput.focus();
}

function closeModal() {
    document.getElementById("generateLinkModal")!.classList.add("hidden");
}

async function handleSaveNote() {
    const note = noteInput.value.trim();
    if (!note) {
        closeModal();
        return;
    }
    modalStatus.textContent = "Saving…";
    saveNoteBtn.disabled = true;

    try {
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyId: currentVenueId, note }),
            credentials: "include",  // Add credentials to send cookies
        });
        if (!res.ok) throw new Error("Status " + res.status);
        const { link } = await res.json();
        modalStatus.innerHTML = `Link: <a href="${link}" target="_blank">${link}</a>`;
    } catch (err) {
        console.error("Save note failed:", err);
        modalStatus.textContent = "Error saving note.";
        saveNoteBtn.disabled = false;
    }
}

onMount(() => {
    venuesContainer = document.getElementById("venuesContainer") as HTMLElement;
    noteInput = document.getElementById("noteInput") as HTMLTextAreaElement;
    saveNoteBtn = document.getElementById("saveNoteBtn") as HTMLButtonElement;
    modalStatus = document.getElementById("modalStatus") as HTMLElement;

    saveNoteBtn.addEventListener("click", handleSaveNote);
    document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);

    // If you have a logout button in your layout:
    logoutButton = document.getElementById("logout-button")!;
    logoutButton?.addEventListener("click", async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",  // Add credentials to send cookies
        });
        window.location.href = "/login";
    });

    fetchAndRenderVenues();
});
