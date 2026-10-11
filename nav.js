/*
 * Navegación entre las secciones "Teoría" y "Simulación" y
 * etiqueta del botón principal (Iniciar / Continuar).
 * No modifica la lógica de la simulación (script.js).
 */
(function () {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const views = {
        teoria: document.getElementById("view-teoria"),
        simulacion: document.getElementById("view-simulacion")
    };

    function showTab(name, options = {}) {
        if (!views[name]) {
            name = "teoria";
        }

        document.body.dataset.tab = name;

        tabs.forEach(tab => {
            const active = tab.dataset.tab === name;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        Object.entries(views).forEach(([key, view]) => {
            view.hidden = key !== name;
        });

        if (options.updateHash !== false) {
            history.replaceState(null, "", `#${name}`);
        }

        if (options.scroll !== false) {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => showTab(tab.dataset.tab));

        tab.addEventListener("keydown", event => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
            }

            const step = event.key === "ArrowRight" ? 1 : -1;
            const next = tabs[(index + step + tabs.length) % tabs.length];

            next.focus();
            showTab(next.dataset.tab);
        });
    });

    /* Botones que llevan a otra sección. */
    document.querySelectorAll("[data-goto]").forEach(button => {
        button.addEventListener("click", () => showTab(button.dataset.goto));
    });

    /* Índice de la teoría: desplazamiento suave a cada apartado. */
    document.querySelectorAll("[data-scroll]").forEach(button => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.scroll);

            if (target) {
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({
                    behavior: reduce ? "auto" : "smooth",
                    block: "start"
                });
            }
        });
    });

    const initial = location.hash.replace("#", "");

    showTab(initial === "simulacion" ? "simulacion" : "teoria", {
        updateHash: false,
        scroll: false
    });

    /*
     * El botón "Iniciar simulación" también reanuda una simulación pausada
     * (script.js lo habilita en ese caso). Para que sea evidente, su texto
     * cambia a "Continuar" mientras el estado del sistema es "Pausada".
     */
    const startButton = document.getElementById("btnStart");
    const statusPill = document.getElementById("systemStatus");

    function syncStartLabel() {
        const paused = statusPill.textContent.trim() === "Pausada";

        startButton.textContent = paused ? "Continuar" : "Iniciar simulación";
        startButton.classList.toggle("resume", paused);
    }

    new MutationObserver(syncStartLabel).observe(statusPill, {
        childList: true,
        characterData: true,
        subtree: true
    });

    syncStartLabel();
})();
