# KPMT 3D Factory Navigator — Prototype

Live demo: https://tragool-c.github.io/kpmt-3d-factory-prototype/

Interactive visual prototype built from the supplied AutoCAD plot image.

## What it demonstrates

- Rotate, pan, and zoom the factory view.
- Focus a production line from the left navigation.
- Click a simulated CNC machine to open a Machine Master panel.
- Toggle the AutoCAD plot reference beneath the 3D objects.

All machine numbers, statuses, controllers, and Master IDs are demo data. This prototype is not suitable for engineering measurement or production decisions.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Then open the local URL printed by Vite.

## Build

```powershell
npm.cmd run build
npm.cmd run preview
```

The production build is written to `dist/`.

## Open from a phone on the same local network

```powershell
npm.cmd run preview -- --host 0.0.0.0 --port 4173
```

Open the `Network` URL printed by Vite on the phone. Do not change Windows Firewall, VPN, or managed network policy to make the prototype reachable.

The responsive interface was tested at a 390 x 844 viewport. Use the `LINES` and `MACHINE` buttons to open the mobile side panels.
