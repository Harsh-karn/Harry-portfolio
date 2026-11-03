import math

# Generate 26 footsteps across viewBox="0 0 1000 300"
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" width="1000" height="300" style="background:#f5efe6;">
  <defs>
    <!-- Marauder's Map Left Foot -->
    <g id="left-foot">
      <!-- Sole -->
      <path d="M 14,0 C 12,-3.8 7,-5.8 2,-5.5 C -3,-5.3 -6,-4.2 -9,-2.2 C -9.8,-1.6 -9.8,-0.7 -9.4,0 C -9,0.9 -7.8,1.6 -6.5,2.2 C -3,3.6 1,5.2 6,5 C 10.5,4.8 13,2.6 14,0 Z" fill="#231d17" />
      <!-- Heel -->
      <path d="M -11.5,-3 C -11.3,0 -11.3,0.8 -11.5,3 C -12.7,3.6 -15.8,3.9 -17.4,2.6 C -19,1.3 -19,-1.3 -17.4,-2.6 C -15.8,-3.9 -12.7,-3.6 -11.5,-3 Z" fill="#231d17" />
    </g>

    <!-- Marauder's Map Right Foot (mirrored) -->
    <g id="right-foot">
      <!-- Sole -->
      <path d="M 14,0 C 12,3.8 7,5.8 2,5.5 C -3,5.3 -6,4.2 -9,2.2 C -9.8,1.6 -9.8,0.7 -9.4,0 C -9,-0.9 -7.8,-1.6 -6.5,-2.2 C -3,-3.6 1,-5.2 6,-5 C 10.5,-4.8 13,-2.6 14,0 Z" fill="#231d17" />
      <!-- Heel -->
      <path d="M -11.5,3 C -11.3,0 -11.3,-0.8 -11.5,-3 C -12.7,-3.6 -15.8,-3.9 -17.4,-2.6 C -19,-1.3 -19,1.3 -17.4,2.6 C -15.8,3.9 -12.7,3.6 -11.5,3 Z" fill="#231d17" />
    </g>
  </defs>
'''

NUM_STEPS = 26
START_X = 40
END_X = 960
SPAN_X = END_X - START_X

for i in range(NUM_STEPS):
    pct = i / (NUM_STEPS - 1)
    x = START_X + pct * SPAN_X
    is_left = (i % 2 == 0)
    foot_id = "left-foot" if is_left else "right-foot"
    lane_y = -11 if is_left else 11
    meander = math.sin(pct * math.pi * 2) * 16
    y = 150 + lane_y + meander
    angle = -7 if is_left else 7
    opacity = 0.88 + 0.12 * math.sin(i * 1.5)
    
    svg += f'  <use id="step-{i}" href="#{foot_id}" transform="translate({x:.1f}, {y:.1f}) rotate({angle})" opacity="{opacity:.2f}" />\n'

svg += '</svg>'

with open("test_full_trail.svg", "w") as f:
    f.write(svg)

print("Saved test_full_trail.svg")

