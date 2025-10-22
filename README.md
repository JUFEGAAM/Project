# VideoGame Project

## Project Goals

* **For the Developer:**
    * Expand knowledge of HTML, CSS, and JavaScript outside of class.
    * Learn project organization, logical planning, and effective problem-solving through tackling the challenges of this project.
* **For the Player:**
    * Provide a satisfying sense of progression.
    * Allow for the optimization of machinery.
    * Present an interesting story.

## BrainStorm / Core Concept

### General Concept
* A mix of different concepts: An "incremental" game (like Cookie Clicker) combined with management and automation ideas from Factorio and Rimworld.

### Core Mechanic: The Core / The God
* The central idea is an entity in the world (a "Core" or "God") that acts as the main "point" producer.
* This god has arrived on Earth and is taking advantage of you with its power.
* You must give it offerings using game resources so it doesn't destroy everything.
* It reacts differently depending on the offering.
* It has emotions: angry, happy, generous, selfish, etc.
* It may give clues about what it wants. Giving it the desired item results in a better reward.

### Ritual Mechanic
* Instead of just clicking, challenges or "rituals" from the god can appear.
* Examples: a small question, a puzzle, a mini-game.
* **Consequences:**
    * **Failure:** Can subtract "points" or cause a negative effect.
    * **Success:** Provides a small bonus.

### Progression and Automation (Machinery & Workers)
* Over time, you unlock more functions.
* **Machinery:** Improves production. They are semi-manual (you have to be attentive to the process).
* **Workers:** You can assign them to automate production. This is based on colony management genres (like Rimworld, Age of Empires).

### Events
* Instead of enemy swarms (which are difficult to make), there will be random events.
* **Events sent by the god:** e.g., __"Give me 100 wood in 60 seconds or your production will drop 50% for 5 minutes."__
* **Random events:** e.g., __"A meteor has destroyed a machine."__
* Events can have a good side: The meteor leaves valuable fragments that can be offered to the core.

### Karma System
* You can follow the path of good things or the path of bad things.
* A karma counter tracks this. When the game has to make a choice, it will give more probability to one outcome or another based on karma.

### Story / Quests
* Quests that make you learn more about the game's story.

### Crafting
* You have to fuse (combine) different materials to create new, more valuable items that you can gift to the god.

### Game Resources
* **Basic:** Wood, Stone, Iron, Gold, Food, Water.
* **Valuable:** Platinum, Meteorite fragments, various Gems/valuable minerals.

## Technical Stack & Viability

* **Technologies:** HTML, CSS, JavaScript (as learned in class).
* **Development Environment:**
    * OS: Omarchy (Arch Linux + Hyprland)
    * Code Editor: NeoVim
    * Version Control: Git + GitHub
    * Local Server: Python (local HTTP server)
    * Testing Browser: Firefox
    * Pixel Art Tool: Piskel or Aseprite
* **Cost:** 0€ (all software is free and open source).
* **Viability:** The project is technically viable. The required technologies are known, and the dev environment is professional and familiar.

## Doubts / Technical Challenges

* **Original Doubt:** Can I make the game save the players games? Should I? Is it difficult? What do I need? A database? A server?
* **Answer/Plan:**
    * A save/load system is planned.
    * It seems it's not too difficult using JavaScript's `localStorage` function. This allows saving data even if the page is closed. It's a simple but functional solution.
    * **Limitations:** If the player clears their browser data, the save will be lost. This is considered an acceptable limitation for the project.
    * **Optional Improvement:** An "Export Game" button could be added for players who want to move their save between computers. The difficulty of this is currently unknown.
* **Other Technical Features:**
    * Game Menu.

## Risk Analysis

* **Technical Risk:** Might encounter JavaScript problems that are hard to solve.
    * **Solution:** Use online communities (Stack Overflow, forums), tutorials, MDN documentation, and ask the professor.
* **Time Risk:** Other subjects, homework, and exams could reduce available time.
    * **Solution:** Realistic planning (10-20h/week), prioritizing core mechanics, and using a phased approach to always have a functional product.
* **Scope Creep Risk:** Trying to add too many features and finishing nothing.
    * **Solution:** Focus on a Minimum Viable Product (MVP) first. Extra features only if time allows. Maintain a clear list of "must-have" vs. "nice-to-have".
* **Dependency Risk:** Problems with the development environment (Linux, NeoVim, etc.).
    * **Solution:** The environment is very stable. Git/GitHub ensures the code is always saved and accessible. Development is possible from any machine with Linux if necessary.

## Development Plan

### General Strategy
* The overall concept is interesting but complicated for a first project.
* **PHASE 1 (Base):** Start with a solid foundation. Polish the main mechanics. Have a functional game that is fun, even if not beautiful or complete.
* **PHASE 2 (Expansion):** Gradually add more features as time and skill allow.

### Time Budget
* **Project Duration:** 3-4 months (October - January/February).
* **Weekly Availability:** 10-20 estimated hours/week (variable based on schoolwork).
* **Total Hours Strategy:** Calculate the time for the basic version first. Improvements and additions will be made only if time is available. This ensures a functional product is always ready.

### Phase 1: Planning (2 weeks)
* **Focus:** Fully define the game idea. Finalize all main mechanics (resource gen, god offerings, points, progression).
* **Tasks:** Define key numerical values (costs, points). Write a minimum of 30 god dialogues. Create the basic file structure (index.html, style.css, game.js). Research the "game loop" concept in JavaScript.
* **Goal:** Have a clear, documented design and the project's technical base ready.

### Phase 2: Pre-Production (Proof of Concept) (2 weeks)
* **Focus:** Create a minimal but functional version (PoC) to validate the core idea.
* **Tasks:**
    * Manual resource generation (click).
    * System to offer resources to the god for points.
    * Purchase of one machine that auto-generates resources.
    * Basic god feedback with random dialogues.
* **Goal:** Have a playable prototype that demonstrates the main game cycle (generate, offer, improve).

### Phase 3: Production (9 weeks)
* **Focus:** Build all game features on top of the PoC.
* **Alpha Stage (5 weeks):** Implement all central mechanics.
    * Tasks: Multiple resource system (wood, stone, etc.). Full machine system (all machines, upgrades, costs). Dynamic god (mood system). Progression system and a clear victory condition.
* **Beta Stage (4 weeks):** Add secondary systems for depth.
    * Tasks: Workers and maintenance (hire workers, machines can break). Crafting system. Interactive rituals (minigames for special offerings). Random events (meteor showers, disasters).
* **Goal:** A game that is complete in content and mechanics.

### Phase 4: Finalization and Delivery (4 weeks)
* **Focus:** Polish the game and prepare for final presentation.
* **Visual/UX Polish (2 weeks):** Improve graphics (UI, icons, animations). Add key features: Save/Load system (`localStorage`) and a tutorial.
* **Testing & Bugfixing (1 week):** Intensive playtesting (by self and others) to find and fix bugs. Adjust difficulty.
* **Documentation & Presentation (1 week):** Clean and comment code. Write project documentation. Prepare a presentation (slides or video). Publish the game to GitHub Pages.
* **Goal:** A polished, stable, well-documented final product ready for evaluation.
