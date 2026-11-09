/* ==========================================================
   Portfolio behavior: Muhammad Safiullah Memon
   1. Theme toggle        5. Copy email
   2. Mobile menu         6. Contact form
   3. Active nav link     7. Profile photo fallback
   4. Project filter      8. Raft cluster demo
   ========================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var EMAIL = "muhammadsafiullah136@gmail.com";

  /* ---------- 1. Theme toggle ---------- */
  var themeBtn = document.getElementById("themeToggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var isDark = theme === "dark";
    themeBtn.textContent = isDark ? "Light" : "Dark";
    themeBtn.setAttribute("aria-pressed", String(isDark));
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* storage may be blocked */ }
  applyTheme(savedTheme || (systemPrefersDark() ? "dark" : "light"));

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- 2. Mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");

  function setMenu(open) {
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- 3. Highlight the nav link for the section in view ---------- */
  var navLinks = Array.prototype.slice.call(siteNav.querySelectorAll("a"));
  var sectionMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sectionMap[id] = { link: link, el: section };
  });

  // Education is part of the "Experience" nav item, so map it there.
  var educationEl = document.getElementById("education");

  function setCurrent(id) {
    navLinks.forEach(function (l) { l.classList.remove("is-current"); l.removeAttribute("aria-current"); });
    if (sectionMap[id]) {
      sectionMap[id].link.classList.add("is-current");
      sectionMap[id].link.setAttribute("aria-current", "true");
    }
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setCurrent(entry.target.id === "education" ? "experience" : entry.target.id);
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(sectionMap).forEach(function (id) { observer.observe(sectionMap[id].el); });
    if (educationEl) observer.observe(educationEl);
  }

  /* ---------- 4. Project filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
  var countEl = document.getElementById("filterCount");

  function filterProjects(cat) {
    var shown = 0;
    projects.forEach(function (p) {
      var match = cat === "all" || p.getAttribute("data-cat") === cat;
      p.hidden = !match;
      if (match) shown += 1;
    });
    countEl.textContent = "Showing " + shown + " of " + projects.length + " projects";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      filterProjects(chip.getAttribute("data-filter"));
    });
  });
  filterProjects("all");

  /* ---------- 5. Copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  var copyStatus = document.getElementById("copyStatus");
  var copyTimer = null;

  function showCopyStatus(msg) {
    copyStatus.textContent = msg;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copyStatus.textContent = ""; }, 2500);
  }

  copyBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(
        function () { showCopyStatus("Email address copied."); },
        function () { showCopyStatus("Couldn't copy. Select the address and copy it manually."); }
      );
    } else {
      showCopyStatus("Couldn't copy. Select the address and copy it manually.");
    }
  });

  /* ---------- 6. Contact form (opens a pre-filled email) ---------- */
  var form = document.getElementById("contactForm");

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    document.getElementById(fieldId + "Error").textContent = message;
    input.parentElement.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var firstInvalid = null;

    setError("name", name ? "" : "Enter your name.");
    setError("email", "");
    setError("message", message ? "" : "Write a short message.");

    if (!name) firstInvalid = form.elements.name;

    if (!email) {
      setError("email", "Enter your email address.");
      firstInvalid = firstInvalid || form.elements.email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Enter a valid email address, like name@example.com.");
      firstInvalid = firstInvalid || form.elements.email;
    }

    if (!message) firstInvalid = firstInvalid || form.elements.message;

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var subject = "Portfolio message from " + name;
    var body = message + "\n\nFrom: " + name + " <" + email + ">";
    window.location.href =
      "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* ---------- 7. Profile photo fallback (shows initials if the image is missing) ---------- */
  var portrait = document.getElementById("portrait");
  var photo = portrait.querySelector("img");

  function showInitials() {
    portrait.textContent = "MS";
    portrait.setAttribute("role", "img");
    portrait.setAttribute("aria-label", "Initials of Muhammad Safiullah Memon");
  }

  photo.addEventListener("error", showInitials);
  if (photo.complete && photo.naturalWidth === 0) showInitials();

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ==========================================================
     8. Raft cluster demo
     Five nodes. Select a node to crash or restart it.
     - Leader crash: followers time out, one becomes a candidate,
       and wins if a majority (3 of 5) of nodes are up.
     - Write: only commits if a leader exists AND a majority is up.
     ========================================================== */
  var svg = document.getElementById("raftSvg");
  var statusEl = document.getElementById("raftStatus");
  var writeBtn = document.getElementById("raftWrite");
  var resetBtn = document.getElementById("raftReset");

  var NS = "http://www.w3.org/2000/svg";
  var N = 5;
  var QUORUM = 3;
  var CX = 160, CY = 118, R = 84, NODE_R = 25;

  var nodes = [];
  var leaderId = null;
  var electionTimer = null;
  var voteTimer = null;
  var electionPending = false;
  var lastMessage = "";

  function make(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function position(i) {
    var angle = (-90 + i * (360 / N)) * Math.PI / 180;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  }

  function aliveCount() {
    return nodes.filter(function (n) { return n.alive; }).length;
  }

  function maxTerm() {
    return nodes.reduce(function (m, n) { return Math.max(m, n.term); }, 0);
  }

  function say(msg) {
    lastMessage = msg;
    statusEl.textContent = msg;
  }

  // Build static SVG layers once: heartbeat lines under, nodes on top.
  var linesLayer = make("g", {});
  var nodesLayer = make("g", {});
  svg.appendChild(linesLayer);
  svg.appendChild(nodesLayer);

  function buildNodes() {
    nodes = [];
    nodesLayer.textContent = "";
    for (var i = 0; i < N; i++) {
      var p = position(i);
      var g = make("g", { "class": "rn", tabindex: "0", role: "button" });
      var circle = make("circle", { "class": "rn-body", cx: p.x, cy: p.y, r: NODE_R });
      var label = make("text", { "class": "rn-label", x: p.x, y: p.y });
      label.textContent = "N" + (i + 1);
      var role = make("text", { "class": "rn-role", x: p.x, y: p.y + NODE_R + 14 });

      g.appendChild(circle);
      g.appendChild(label);
      g.appendChild(role);
      nodesLayer.appendChild(g);

      nodes.push({ id: i, alive: true, role: "follower", term: 1, el: g, roleEl: role, x: p.x, y: p.y });
      bindNode(nodes[i]);
    }
  }

  function bindNode(node) {
    node.el.addEventListener("click", function () { toggleNode(node.id); });
    node.el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNode(node.id);
      }
    });
  }

  function render() {
    // Nodes
    nodes.forEach(function (n) {
      var state = n.alive ? n.role : "crashed";
      n.el.setAttribute("class", "rn is-" + state);
      n.roleEl.textContent = n.alive ? n.role + ", term " + n.term : "crashed";
      n.el.setAttribute(
        "aria-label",
        "Node " + (n.id + 1) + ", " + (n.alive ? n.role + ", term " + n.term : "crashed") +
        ". " + (n.alive ? "Press to crash." : "Press to restart.")
      );
      n.el.setAttribute("aria-pressed", String(!n.alive));
    });

    // Heartbeat lines from the leader to each live follower
    linesLayer.textContent = "";
    if (leaderId !== null && nodes[leaderId].alive) {
      var lead = nodes[leaderId];
      nodes.forEach(function (n) {
        if (n.alive && n.id !== leaderId) {
          linesLayer.appendChild(make("line", {
            "class": "hb-line", x1: lead.x, y1: lead.y, x2: n.x, y2: n.y
          }));
        }
      });
    }
  }

  function clearTimers() {
    clearTimeout(electionTimer);
    clearTimeout(voteTimer);
    electionPending = false;
  }

  function scheduleElection() {
    if (electionPending || aliveCount() === 0) return;
    electionPending = true;
    electionTimer = setTimeout(startElection, 1200);
  }

  function startElection() {
    var alive = nodes.filter(function (n) { return n.alive; });
    if (alive.length === 0) { electionPending = false; return; }

    var candidate = alive[Math.floor(Math.random() * alive.length)];
    candidate.role = "candidate";
    candidate.term = maxTerm() + 1;
    say("N" + (candidate.id + 1) + " timed out waiting for a heartbeat and asks for votes in term " + candidate.term + ".");
    render();

    voteTimer = setTimeout(function () {
      electionPending = false;
      if (!candidate.alive) { scheduleElection(); return; }

      var votes = aliveCount();
      if (votes >= QUORUM) {
        leaderId = candidate.id;
        nodes.forEach(function (n) {
          if (n.alive) { n.term = candidate.term; n.role = n.id === candidate.id ? "leader" : "follower"; }
        });
        say("N" + (candidate.id + 1) + " won " + votes + " of " + N + " votes and is the new leader for term " + candidate.term + ".");
      } else {
        candidate.role = "follower";
        say("Only " + votes + " of " + N + " nodes are up. A leader needs " + QUORUM + " votes, so the cluster has no leader.");
      }
      render();
    }, 1000);
  }

  function toggleNode(id) {
    var node = nodes[id];
    var name = "N" + (id + 1);

    if (node.alive) {
      var wasLeader = leaderId === id;
      node.alive = false;
      node.role = "follower";

      if (wasLeader) {
        leaderId = null;
        say(name + " (the leader) crashed. The followers are waiting for a heartbeat that won't come.");
        render();
        clearTimers();
        scheduleElection();
        return;
      }

      if (aliveCount() < QUORUM) {
        say(name + " crashed. Only " + aliveCount() + " of " + N + " nodes are up, which is below the majority of " + QUORUM + ".");
      } else {
        say(name + " crashed. The leader is still serving with " + aliveCount() + " of " + N + " nodes.");
      }
      render();
      return;
    }

    // Restart: the node rejoins as a follower and adopts the current term.
    node.alive = true;
    node.role = "follower";
    node.term = maxTerm();
    say(name + " restarted and rejoined as a follower.");
    render();

    var leaderAlive = leaderId !== null && nodes[leaderId].alive;
    if (!leaderAlive && !electionPending) scheduleElection();
  }

  writeBtn.addEventListener("click", function () {
    var up = aliveCount();
    if (leaderId === null || !nodes[leaderId].alive) {
      say("Write rejected: there is no leader right now.");
    } else if (up < QUORUM) {
      say("Write rejected: only " + up + " of " + N + " nodes are up, so it can't reach a majority.");
    } else {
      say("Write x = 1 committed. It reached " + up + " of " + N + " nodes, which is a majority.");
    }
  });

  function reset() {
    clearTimers();
    buildNodes();
    leaderId = 0;
    nodes[0].role = "leader";
    say("N1 is the leader for term 1. All 5 nodes are up.");
    render();
  }

  resetBtn.addEventListener("click", reset);
  reset();
})();