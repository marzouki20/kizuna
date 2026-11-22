
# 🌱 Agribot by RoboCore

### AI-Powered Autonomous Agricultural Robot

**Detect plant diseases. Apply targeted treatments. Save water. Run on solar energy.**

Agribot is an intelligent agricultural robotics project developed by **RoboCore** for **Hackathon Kizuna 2026**, hosted at ESPRIT, Tunisia, as part of a Tunisia–Japan technology collaboration.

<p align="center">
  <strong>Smart Agriculture · Artificial Intelligence · Robotics · Renewable Energy</strong>
</p>

---

## 📸 Project Overview


## 🌍 1. The Problem

Agriculture in Tunisia faces increasing pressure from plant diseases and water scarcity, particularly in arid and semi-arid regions.

The main challenges include:

- **Late disease detection:** Diseases are often identified after significant damage has occurred.
- **Water scarcity:** Tunisia faces severe water stress, making efficient agricultural water management essential.
- **Uniform treatment:** Agricultural inputs are sometimes applied without considering the specific needs of individual plants.
- **Increasing production costs:** Disease outbreaks and inefficient resource management affect farmers' profitability.

Tomatoes are an important agricultural export for Tunisia. Disease outbreaks, including late blight, can significantly affect production.

Our question:

**Can a low-cost, solar-powered robot detect plant diseases early and apply targeted treatments directly in the field?**

## 🚀 2. Our Solution

Agribot is an autonomous agricultural robot built around a **Raspberry Pi 3 and STM32 microcontroller**.

The system aims to:

- Detect plant diseases and anomalies using computer vision and artificial intelligence.
- Identify potential water stress and crop deficiencies.
- Analyze captured images locally using Edge AI.
- Control a smart pumping system for targeted treatment.
- Carry multiple reservoirs for water, nutrients and treatment solutions.
- Use solar energy as its primary power source.
- Integrate an air-to-water condenser as a planned water-generation feature.

## ⚙️ 3. How It Works

Agribot follows five main operational stages:

| Stage | Operation | Description |
|---|---|---|
| 1. Navigate | Autonomous movement | Move along agricultural crop rows. |
| 2. Detect | Image acquisition | Capture plant images using the onboard camera. |
| 3. Decide | AI analysis | Identify diseases, pests and plant stress. |
| 4. Treat | Targeted application | Activate the pump to spray affected plants. |
| 5. Recharge | Solar energy | Supply electrical power using a photovoltaic panel and battery. |

## 🧠 4. Technical Architecture

### Hardware

| Component | Function |
|---|---|
| Raspberry Pi 3 | Computer vision and AI inference |
| STM32 | Real-time control and hardware management |
| Camera 5 MP Rev 1.3 | Plant image acquisition |
| Field sensors | Environmental and agricultural monitoring |
| Smart pump | Targeted treatment application |
| Multiple reservoirs | Storage of different solutions |
| Solar panel | Renewable energy generation |
| Battery | Electrical energy storage |

### Software

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| OpenCV | Image processing |
| PyTorch | Deep learning |
| Ultralytics YOLO | Object detection |
| YOLO11n | Plant disease detection model |
| Anomaly detection | Identification of plant stress |
| Embedded control | Pump and motor management |
| Web interface | Remote monitoring |

### System Workflow

```text
             Camera 5 MP
                  |
                  v
            Raspberry Pi 3
                  |
          OpenCV + YOLO11n
                  |
                  v
         Disease Classification
                  |
                  v
          Decision System
                  |
                  v
                STM32
                  |
           +------+------+
           |             |
           v             v
        Motors        Smart Pump
                         |
                    Reservoirs
                         |
                  Targeted Spraying

     Solar Panel ---> Battery ---> Power Supply
```

## 🍃 5. Plant Diseases and Anomalies

The YOLO11n model was trained to recognize **24 classes** covering multiple agricultural categories.

### Leaf Diseases

- Early Blight
- Late Blight
- Leaf Mold
- Septoria
- Bacterial Spot
- Powdery Mildew
- Mosaic Virus
- Yellow Leaf Curl

### Cassava Diseases

- Cassava Bacterial Blight (CBB)
- Cassava Brown Streak Disease (CBSD)
- Cassava Green Mottle (CGM)
- Cassava Mosaic Disease (CMD)

### Pests

- Spider Mites
- Leaf Miner
- Harmful Insects
- Parasites

### Plant Stress and Deficiencies

- Chlorosis
- Water Excess
- Water Deficiency
- Sun Excess
- Sun Deficiency
- Abnormal Redness

*The class list above follows the project presentation. Actual class availability and annotation counts should be checked against the final dataset configuration.*

## 📊 6. Artificial Intelligence – YOLO11n

Agribot uses **YOLO11n**, a lightweight object detection model designed for efficient inference.

### Dataset

| Property | Value |
|---|---|
| Total images | 47,813 |
| Number of datasets | 9 public datasets |
| Number of classes | 24 |
| Model | YOLO11n |
| Parameters | 2.6 million |
| Model size | Approximately 5.5 MB |

### YOLO11n Results – Three Random Seeds

| Metric | Seed 0 | Seed 42 | Seed 123 | Mean |
|---|---:|---:|---:|---:|
| Precision | 0.6333 | 0.6519 | 0.6178 | 0.6343 |
| Recall | 0.5972 | 0.5916 | 0.5992 | 0.5960 |
| mAP@50 | 0.5993 | 0.6111 | 0.6051 | 0.6052 |
| mAP@50-95 | 0.3588 | 0.3681 | 0.3641 | 0.3637 |

### Model Comparison

| Model | mAP@50 |
|---|---:|
| YOLOv8n | 0.588 |
| YOLO11n | 0.611 |
| YOLO11s | 0.635 |
| YOLO11m | 0.638 |

**YOLO11n achieved a mean mAP@50 of 60.52% across three seeds.** The best reported seed was Seed 42, with an mAP@50 of 61.11%.

The lightweight architecture makes YOLO11n a candidate for embedded deployment.

*Important: the reported model metrics were obtained during model evaluation, not from real-time inference on the Raspberry Pi 3. Embedded inference speed still needs to be benchmarked.*

## 🔬 7. Use Case – Early Detection of Late Blight

A typical Agribot operating scenario:

1. The robot moves along a tomato crop row.
2. The camera captures images of the plants.
3. YOLO11n analyzes the images and detects potential Late Blight.
4. The decision system identifies the affected plants.
5. The STM32 controls the motors and pumping system.
6. The pump sprays only the targeted plants.

*This is the intended operating scenario. Treatment selection, dosage, safety and real-world effectiveness require field validation.*

## 🏆 8. What Makes Agribot Different?

| Feature | Agribot |
|---|---|
| Disease detection | AI-based crop disease identification |
| Edge AI | Local inference without mandatory cloud connectivity |
| Multi-crop | 24 detection classes |
| Precision treatment | Targeted pumping and spraying |
| Energy | Solar-powered architecture |
| Hardware | Raspberry Pi 3 + STM32 |
| Accessibility | Designed around low-cost embedded hardware |

Unlike many agricultural robots that focus mainly on mechanical weeding, Agribot focuses on **plant disease detection and targeted treatment**.

## 🌱 9. Environmental Impact and SDGs

Agribot contributes to three United Nations Sustainable Development Goals.

| SDG | Goal | Contribution |
|---|---|---|
| SDG 6 | Clean Water and Sanitation | Targeted irrigation and reduced avoidable water waste |
| SDG 7 | Affordable and Clean Energy | Solar-powered operation |
| SDG 9 | Industry, Innovation and Infrastructure | AI-based crop monitoring and agricultural robotics |

### Water Management

Targeted irrigation and the planned air-to-water condenser aim to improve water resource management.

### Renewable Energy

The robot is designed to operate using a photovoltaic panel and battery system.

### Sustainable Agriculture

AI-powered crop monitoring can help farmers identify problems earlier and apply treatments more precisely.

## 💼 10. Business Model

Agribot targets:

- Farmers and agricultural farms.
- Agricultural cooperatives.
- Greenhouses and nurseries.
- Agricultural companies.
- Agricultural research centers.

### Revenue Streams – Indicative Pricing

| Revenue Stream | Estimated Price |
|---|---:|
| Agribot robot sale | 6,500–8,500 TND / unit |
| Seasonal rental | 900–1,400 TND / season |
| Monitoring platform (SaaS) | 40–70 TND / month |
| Annual maintenance | 450–700 TND / year |
| Crop-specific customization | 800–1,500 TND / project |

### Estimated Prototype Cost

**3,300–5,070 TND**

This is an indicative estimate covering prototype hardware, mechanical construction and engineering services.

*All proposed prices require supplier quotations, operational cost analysis and validation with pilot farms. They are not confirmed commercial offers.*

## 🛠️ 11. Getting Started

### Requirements

- Raspberry Pi 3 or compatible development computer.
- Python 3.9 or later.
- Compatible camera.
- Trained YOLO model weights.
- OpenCV and Ultralytics.

### Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

Install dependencies:

```bash
pip install ultralytics opencv-python torch
```

### Run YOLO11n Detection

```python
from ultralytics import YOLO

# Load the trained model
model = YOLO("models/best.pt")

# Start camera detection
results = model.predict(
    source=0,
    show=True,
    conf=0.25
)
```

`source=0` selects the default connected camera.

*This example demonstrates basic camera inference. It does not implement the full robot control, navigation or treatment workflow.*

## 🗺️ 12. Development Roadmap

### Short Term

- [ ] Benchmark and optimize YOLO11n on Raspberry Pi 3.
- [ ] Improve rare classes such as Leaf Mold and Harmful Insects.
- [ ] Measure solar autonomy and power consumption.
- [ ] Validate camera-based detection in agricultural environments.

### Medium Term

- [ ] Develop the air-to-water condenser.
- [ ] Conduct field tests with pilot farms and cooperatives.
- [ ] Implement autonomous navigation along crop rows.
- [ ] Develop dosage control for each detected disease.
- [ ] Integrate the monitoring dashboard.

### Long Term

- [ ] Commercialize Agribot through sales and seasonal rental.
- [ ] Expand detection to more crops and agricultural regions.
- [ ] Develop partnerships between Tunisia and Japan.
- [ ] Improve the robot's autonomy and precision agriculture capabilities.

## 👥 13. Team

**RoboCore – Agribot Project**

- `Mohamed Raed Boukari`
- `Mohamed Khalil Marzouki`
- `Rihem Ghali`
- `Ayoub Kassraouie`

**Institution:** ESPRIT – Tunisia  
**Event:** Hackathon Kizuna 2026  
**Collaboration:** Tunisia–Japan

## 📚 14. References

- [FAO – Regional Water Scarcity Initiative](https://www.fao.org/)
- [IFAD – Tunisia Country Information](https://www.ifad.org/en/web/operations/w/country/tunisia)
- [Ultralytics YOLO Documentation](https://docs.ultralytics.com/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [PyTorch Documentation](https://pytorch.org/docs/stable/index.html)

## 📄 15. License

This project is currently under development.

Choose an appropriate open-source license before public distribution, such as the [MIT License](https://opensource.org/license/mit).

---

<p align="center">
  <strong>RoboCore – Innovating for a Sustainable Future 🌍</strong>
  <br>
  Smart Agriculture · AI · Robotics · Renewable Energy
  <br><br>
  <em>Built for Tunisia, open to Japan.</em>
</p>
