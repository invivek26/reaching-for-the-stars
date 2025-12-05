# Reaching for the Stars: Can We Afford It?

A dueling scrollytelling visual data story exploring the debate around space exploration investments.

## Project Overview

**Team Members**: Manya, Vivek, Sehas, Samyogita, Razan, Aryan (6-person team)

**Topic**: Space Exploration Investment Debate - examining whether humanity should prioritize space exploration or focus resources on solving Earth's pressing problems.

### Why This Story?

Throughout history, humans have explored land, water, and air, and now we reach for the stars. Space exploration began before the 2000s, initiated by a few pioneering countries that gradually spread this ambitious pursuit across the globe. Yet in our tunnel-visioned focus on exploring distant worlds, have we forgotten about the one we're living on?

This raises a critical question: Is the time, money, resources, and environmental impact of space exploration really worth it? Could we instead improve and take care of our planet rather than searching for a new one?

The project explores this debate through two contrasting perspectives:

- **One side**: Focused on saving our home planet, arguing resources should address education, healthcare, and climate change
- **Other side**: Believes our survival lies in the stars beyond, emphasizing long-term innovation and expansion

## Technical Implementation

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: D3.js v7
- **Additional Libraries**:
  - Three.js (for 3D elements)
  - D3-sankey (for flow diagrams)
  - D3-simple-slider (for interactive controls)
- **Scrollytelling**: Custom implementation with Intersection Observer API
- **No Backend**: Pure frontend implementation using static data files

### Project Structure

```
/experiments/manya/
├── index.html              # Main entry point
├── app.js                  # Core application logic & scroll handling
├── styles.css              # Complete styling and animations
├── assets/                 # Images (Earth, rockets, flags)
├── data/                   # All datasets (CSV/JSON)
└── js/                     # Individual visualization modules
    ├── manya1.js           # Space tech economic impact
    ├── manya2.js           # Space economy analysis
    ├── vivek1.js           # International collaboration network
    ├── vivek2.js           # Investment-to-jobs flow
    ├── sehas1.js           # Mission success/failure analysis
    ├── sehas2.js           # Top budget missions
    ├── samyogita1.js       # Space vs climate spending
    ├── samyogita2.js       # Space debris visualization
    ├── razan1.js           # Mission cost vs duration
    ├── razan2.js           # Failed missions budget
    └── aryan1.js           # Space technology byproducts
```

### Scrollytelling Implementation

- **Intersection Observer**: Triggers visualization initialization when sections enter viewport
- **Smooth Animations**: CSS transitions combined with D3 animations
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimization**: Lazy loading of visualizations to prevent overwhelming the browser

## Datasets

### Primary Data Sources (11 datasets)

1. **Global_Space_Exploration_Dataset.csv** - Comprehensive mission data
   - Countries, years, mission types, budgets, success rates
   - Technology used, environmental impact, collaborations
   - 400+ space missions from 2002-2024

2. **econ_impact.json** - Economic impact of space technologies
   - Medical, communication, navigation, safety technologies
   - Economic value and lives saved metrics
   - Hierarchical data structure with categories and subcategories

3. **space_economy_data.json** - Space industry economics
   - Employment data, compensation, revenue trends
   - U.S. Bureau of Economic Analysis data (2012-2023)
   - Space sector economic contribution metrics

4. **budget_history.csv** - Government space spending over time
   - National space agency budgets
   - Historical spending patterns and trends

5. **earth_disasters.csv / emdat_events.csv** - Natural disaster costs
   - Economic damage from climate events
   - Used for comparing space spending vs disaster costs

6. **satellites.json** - Active satellite tracking data
   - Orbital debris and space pollution metrics
   - Collision risk assessments

7. **launches.json** - Launch frequency and success data
   - Mission outcomes and failure analysis
   - Launch site and vehicle information

8. **space_events.csv** - Historical space milestones
   - Key missions and technological breakthroughs

9. **Space_Corrected.csv** - Processed mission data
   - Cleaned and normalized space mission database

10. **timeline.json** - Space exploration timeline
    - Chronological progression of space achievements

### Data Processing Approach

- **Client-side Processing**: All data transformation handled in JavaScript/D3
- **Multiple Formats**: Support for both CSV (using d3.csv()) and JSON data
- **Real-time Calculations**: Dynamic metrics computed during visualization
- **Data Validation**: Error handling for missing or malformed data

## Narrative Approach

### Story Structure

The story is organized into **5 Acts** with 11 visualization sections:

**ACT I - THE GREAT COLLABORATION**

- International cooperation networks showing how space brings nations together

**ACT II - THE PRICE TAG**

- Budget analysis, mission costs, and failure expenses
- Examining what we spend and what we lose

**ACT III - THE ENVIRONMENTAL BILL**

- Space vs. climate spending comparison
- Space debris and pollution above our heads

**ACT IV - THE RETURNS**

- Technologies that flow back to Earth
- Jobs and economic benefits from space investment
- How space missions evolve and improve

**EPILOGUE - YOUR VERDICT**

- Interactive choice mechanism for users to decide their stance
- Three options: Earth First, Balance Both, Space Forward

### Storytelling Techniques

- **Progressive Disclosure**: Information revealed as user scrolls
- **Contextual Narration**: Each section has story text explaining significance
- **Visual Rhetoric**: Charts designed to support narrative arguments
- **Interactive Elements**: User can explore data and make choices
- **Emotional Design**: Visual effects (rocket launch, Earth imagery) create engagement

## Visualization Catalog

### Core Visualizations (12+ different charts)

#### 1. Space Technology Impact (manya1.js)

- **Type**: Interactive hierarchical bar chart with economic ranking
- **Innovation**: Dual-sorting animation (economic value vs lives saved)
- **Data**: Economic impact of space-derived technologies
- **Interaction**: Toggle between ranking criteria, hover tooltips

#### 2. Space Economy Analysis (manya2.js)

- **Type**: Multi-line time series with interactive scrubbing
- **Data**: Government spending vs space economy output over time
- **Interaction**: Year slider for temporal exploration

#### 3. International Collaboration Network (vivek1.js)

- **Type**: Force-directed network graph with flag nodes
- **Innovation**: Country flag integration, dynamic edge weighting
- **Data**: Collaboration patterns between nations
- **Interaction**: Drag nodes, hover for collaboration details

#### 4. Investment-to-Jobs Flow (vivek2.js)

- **Type**: Sankey diagram showing money flow
- **Data**: How space investment translates to employment
- **Interaction**: Flow highlighting and tooltips

#### 5. Mission Success/Failure Analysis (sehas1.js)

- **Type**: Diverging bar chart (success vs failure)
- **Data**: Mission outcomes by budget and year
- **Interaction**: Filter by time periods

#### 6. Top Budget Missions (sehas2.js)

- **Type**: Bubble chart with mission details
- **Data**: Highest-cost space missions
- **Interaction**: Bubble size represents cost, hover for details

#### 7. Space vs Climate Spending (samyogita1.js)

- **Type**: Comparative bar chart with disaster overlay
- **Data**: Space budgets vs natural disaster economic costs
- **Interaction**: Time filtering and comparison modes

#### 8. Space Debris Prison (samyogita2.js)

- **Type**: Animated particle system with statistics dashboard
- **Data**: Orbital debris accumulation over time
- **Interaction**: Real-time debris generation simulation

#### 9. Mission Analysis Scatter (razan1.js)

- **Type**: Bubble chart (cost vs duration vs success)
- **Data**: Mission characteristics by country and outcome
- **Interaction**: Country filtering, size/color encoding

#### 10. Failed Mission Budget (razan2.js)

- **Type**: Area chart showing cumulative losses
- **Data**: Money lost to failed missions over time
- **Interaction**: Temporal highlighting and failure breakdown

#### 11. Byproduct Technologies (aryan1.js)

- **Type**: Treemap or network showing technology transfer
- **Data**: Technologies originally developed for space now used on Earth
- **Interaction**: Category exploration and impact details

### Visualization Techniques Summary

- **6+ Different Techniques**: Bar charts, network graphs, time series, scatter plots, flow diagrams, particle systems
- **Interactive Elements**: 25% of charts include animations or interactivity
- **Responsive Design**: All visualizations adapt to screen size
- **Consistent Theming**: Space-themed color palette and typography

## Interactive Features

### Animation System

- **Rocket Launch**: Scroll-triggered rocket animation with physics-based movement
- **Particle Effects**: Debris generation during rocket launch
- **Star Field**: Parallax scrolling background with twinkling stars
- **Earth Rotation**: Subtle planetary movement effects

### User Interactions

- **Scroll-based Navigation**: Primary interaction method
- **Data Exploration**: Hover tooltips, click interactions, filtering
- **Choice Mechanism**: Final section allows users to pick their stance
- **Visual Feedback**: Buttons, highlights, and state changes

### Responsive Design

- **Multi-device Support**: Desktop, tablet, mobile optimization
- **Flexible Layouts**: Grid-based responsive visualization containers
- **Touch-friendly**: Mobile-optimized interaction targets

## Innovative Visualizations

### 1. Technology Impact Ranking (manya1.js)

**Innovation Justification**:

- Combines economic metrics with humanitarian impact (lives saved)
- Animated re-ranking system that smoothly transitions between sort criteria
- Real-time calculation of impact metrics with visual encoding

### 2. Collaboration Network with Flags (vivek1.js)

**Innovation Justification**:

- Novel use of country flag images as network nodes
- Dynamic edge thickness based on collaboration frequency
- Integration of geopolitical data with network visualization
- Interactive force simulation with real-world imagery

## Setup & Usage Instructions

### Running the Project

1. **Clone/Download** the project repository
2. **Navigate** to `/experiments/manya/` directory
3. **Open** `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
4. **Alternative**: Use a local server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx http-server

   # Using VS Code Live Server extension
   ```

### Browser Requirements

- **Modern Browser**: ES6+ support required
- **JavaScript Enabled**: Core functionality depends on JS
- **Recommended**: Chrome/Chromium-based browsers for optimal performance

### File Structure Navigation

- **Entry Point**: `/experiments/manya/index.html`
- **Visualizations**: Individual JS modules in `/js/` directory
- **Data Files**: All datasets located in `/data/` directory
- **Assets**: Images and graphics in `/assets/` directory

## Performance Considerations

- **Lazy Loading**: Visualizations load only when scrolled into view
- **Memory Management**: Cleanup of animations and event listeners
- **Data Optimization**: Preprocessed datasets for faster loading
- **Efficient Rendering**: RequestAnimationFrame for smooth animations

## Future Enhancements

- **Additional Perspectives**: More nuanced viewpoints on space exploration
- **Real-time Data**: Integration with live space mission APIs
- **Enhanced Interactivity**: More complex user choice mechanisms
- **Mobile Optimization**: Further mobile-specific interaction improvements

---

**Total Visualizations**: 12+ charts across 11 sections  
**Team Size**: 6 members  
**Technical Requirement Compliance**: ✅ All requirements met  
**Innovation Count**: 2+ innovative visualizations identified  
**Scrollytelling**: ✅ Fully implemented  
**D3.js Usage**: ✅ All charts built with D3  
**Interactivity**: ✅ 25%+ charts include animations/interactions

This project represents a comprehensive exploration of the space exploration debate through sophisticated data visualization and storytelling techniques.
