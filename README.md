# KPMT 3D Factory Navigator — Prototype

Live demo: https://tragool-c.github.io/kpmt-3d-factory-prototype/

Interactive visual prototype built from the supplied AutoCAD plot image.

## What it demonstrates

- Rotate, pan, and zoom the factory view.
- Focus a production line from the left navigation.
- Click a simulated CNC machine to open a Machine Master panel.
- Toggle the AutoCAD plot reference beneath the 3D objects.

Unless stated below, machine numbers, statuses, controllers, and Master IDs are demo data. This prototype is not suitable for engineering measurement or production decisions.

`LOADER VALVE 2` is the first hybrid-data pilot. Its eight machine identities come from a read-only Machine Master Production v4 snapshot. The three MAKINO J4 machines use a dedicated procedural low-poly model. Their positions and rotations remain visual approximations until a DXF layout is supplied. Other production lines still use demo data.

Use `?line=VALVE` to open a direct focused view with persistent labels for all eight verified machines and blue locator pads for the three MAKINO J4 models.

Use `?focus=J4` for the phone-friendly close view of `MC049`, `MC050`, and `MC051` only.

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
