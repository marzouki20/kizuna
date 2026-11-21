# Agribot by RoboCore

**An autonomous, solar-powered robot that detects plant disease with computer vision and treats it on the spot.**

Built for **Hackathon Kizuna 2026** at ESPRIT (Tunisia–Japan technology collaboration).
Themes: Agriculture · Water · Renewable Energy.

![Agribot concept render](assets/agribot-concept.jpg)

> Concept render. The detection label shown on the screen is an illustration, not a measured result.

---

## The problem

In Tunisia and other arid and semi-arid regions, farmers face three issues:

- **Late detection**: diseases, deficiencies and water stress are spotted once damage is irreversible.
- **Uniform application**: water and inputs are applied everywhere, and wasted.
- **Limited autonomy**: current solutions are manual and energy-dependent.

The result is lower yields, higher costs and a threat to regional food security.

## The solution

Agribot is an autonomous robot, built on **Raspberry Pi**, that:

- detects plant anomalies in real time (computer vision + AI),
- applies the right treatment through a smart pumping system,
- carries reservoirs for water, nutrients and targeted treatments,
- runs entirely on solar energy.

## How it works

1. **Navigate** autonomously along the crop rows.
2. **Detect** anomalies (diseased leaves, water stress) with the camera.
3. **Decide**: the AI analysis selects the treatment.
4. **Treat**: pump and reservoirs apply it precisely on the affected plants.
5. **Recharge**: PV panel and battery power the whole system.

## Architecture

### Hardware

- Raspberry Pi
- Camera (5 MP, Rev 1.3) and field sensors
- Smart pump and multi-solution reservoirs
- Solar panel and battery

### Software

- Computer vision: OpenCV
- Deep learning: PyTorch, Ultralytics YOLO
- Anomaly detection algorithm
- Decision system and pump control
- Web monitoring interface

## Prototype

![Agribot hackathon prototype](assets/agribot-prototype.jpg)

Cardboard mock-up built during the hackathon: camera, three spray lines and an electronics bay.

## Impact and SDGs

| Pillar | SDG | Contribution |
|---|---|---|
| Water | SDG 6, Clean water and sanitation | Targeted irrigation reduces avoidable waste |
| Energy | SDG 7, Affordable and clean energy | 100% solar operation, no grid dependence |
| Agriculture | SDG 9, Industry, innovation and infrastructure | AI crop monitoring and agricultural robotics |

## Business model

![Business Model Canvas](assets/business-model-canvas.jpg)

Indicative launch pricing (to be validated with pilot farms):

| Stream | Price (TND) |
|---|---|
| Agribot robot sale | 6,500 – 8,500 / unit |
| Seasonal rental | 900 – 1,400 / season |
| Monitoring platform (SaaS) | 40 – 70 / month |
| Annual maintenance | 450 – 700 / year |
| Crop-specific customization | 800 – 1,500 / project |

Estimated prototype cost: 3,300 – 5,070 TND.

## Getting started

> Adapt this section to your repository.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
pip install ultralytics opencv-python
```

```python
from ultralytics import YOLO

model = YOLO("path/to/your_weights.pt")   # your trained model
results = model.predict(source=0, show=True)  # 0 = camera
```

## Roadmap

- [ ] Field tests with pilot farms
- [ ] Multi-crop disease model
- [ ] Autonomous navigation along rows
- [ ] Dose control per detected disease
- [ ] Monitoring dashboard

## Team

- <Name 1>
- <Name 2>
- <Name 3>

ESPRIT, Hackathon Kizuna 2026.

## License

<Choose a license, e.g. MIT>
