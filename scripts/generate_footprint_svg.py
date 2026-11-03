import xml.etree.ElementTree as ET
from PIL import Image
import os

# Create an SVG with left and right footprint definitions
svg_code = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200" style="background:#f4eee3;">
  <defs>
    <!-- Left Footprint (refined Marauder's Map boot silhouette, pointing right) -->
    <g id="left-foot">
      <!-- Sole -->
      <path d="M 18,0 C 15.5,-4.8 9.5,-7.2 3.5,-7 C -2.5,-6.8 -6.5,-5.5 -10,-3 C -11,-2.2 -11,-1 -10.5,0 C -10,1.2 -8.5,2.2 -7,3 C -3,4.8 2,6.8 8,6.5 C 13.5,6.2 16.8,3.5 18,0 Z" fill="#241d18" />
      <!-- Heel -->
      <path d="M -13,-4 C -12.8,0 -12.8,1 -13,4 C -14.5,4.8 -18.5,5.2 -20.5,3.5 C -22.5,1.8 -22.5,-1.8 -20.5,-3.5 C -18.5,-5.2 -14.5,-4.8 -13,-4 Z" fill="#241d18" />
    </g>

    <!-- Right Footprint (mirrored horizontally across Y-axis) -->
    <g id="right-foot">
      <!-- Sole -->
      <path d="M 18,0 C 15.5,4.8 9.5,7.2 3.5,7 C -2.5,6.8 -6.5,5.5 -10,3 C -11,2.2 -11,1 -10.5,0 C -10,-1.2 -8.5,-2.2 -7,-3 C -3,-4.8 2,-6.8 8,-6.5 C 13.5,-6.2 16.8,-3.5 18,0 Z" fill="#241d18" />
      <!-- Heel -->
      <path d="M -13,4 C -12.8,0 -12.8,-1 -13,-4 C -14.5,-4.8 -18.5,-5.2 -20.5,-3.5 C -22.5,-1.8 -22.5,1.8 -20.5,3.5 C -18.5,5.2 -14.5,4.8 -13,4 Z" fill="#241d18" />
    </g>
  </defs>

  <!-- Render a walking trail of 16 footsteps from left to right -->
'''

for i in range(16):
    pct = i / 15.0
    x = 50 + pct * 700
    is_left = (i % 2 == 0)
    foot_id = "left-foot" if is_left else "right-foot"
    lane_y = -10 if is_left else 10
    # Gentle subtle corridor meander
    import math
    meander = math.sin(pct * math.pi * 2) * 14
    y = 100 + lane_y + meander
    # Natural walking toe angle: slight outward tilt
    angle = -6 if is_left else 6
    # Slight opacity variance like real ink
    opacity = 0.85 + 0.15 * math.sin(i * 1.7)
    
    svg_code += f'  <use href="#{foot_id}" transform="translate({x:.1f}, {y:.1f}) rotate({angle})" opacity="{opacity:.2f}" />\n'

svg_code += '</svg>'

with open("test_marauder_trail.svg", "w") as f:
    f.write(svg_code)

print("Saved test_marauder_trail.svg")
