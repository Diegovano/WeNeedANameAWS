import numpy as np
import matplotlib.pyplot as plt

# Define known points A, B, C
x_coords = np.array([1, 340, 340])
y_coords = np.array([1, 1, 340])

# Observed angles
observer_angle_AB = np.pi * 4 / 6
observer_angle_AC = np.pi * 1 / 3
observer_angle_BC = np.pi

# Calculate length of sides AB and AC
length_AB = np.sqrt((x_coords[1] - x_coords[0]) ** 2 + (y_coords[1] - y_coords[0]) ** 2)
length_AC = np.sqrt((x_coords[2] - x_coords[0]) ** 2 + (y_coords[2] - y_coords[0]) ** 2)

# Shift coordinates such that A is located at (0, 0)
coords_A = np.array([x_coords - x_coords[0], y_coords - y_coords[0]])

# Create matrices for transformation and change of basis
P_AB = np.vstack((coords_A[:, 1], np.array([[0, 1], [-1, 0]]).dot(coords_A[:, 1]))).T / length_AB
P_AC = np.vstack((coords_A[:, 2], np.array([[0, 1], [-1, 0]]).dot(coords_A[:, 2]))).T / length_AC

# Calculate transformed coordinates in new orthogonal basis AB and AC
coords_AB = np.linalg.solve(P_AB, coords_A)
coords_AC = np.linalg.solve(P_AC, coords_A)

# Calculate points in new orthogonal basis AB
peri_coords_AB = np.array([length_AB / 2, length_AB / 2 * np.tan(np.pi / 2 - observer_angle_AB / 2)])
center_coords_AB = np.array([peri_coords_AB[1], -peri_coords_AB[0]])
radius_AB = np.sqrt(np.sum(center_coords_AB ** 2))

# Calculate points in new orthogonal basis AC
peri_coords_AC = np.array([length_AC / 2, length_AC / 2 * np.tan(np.pi / 2 - observer_angle_AC / 2)])
center_coords_AC = np.array([peri_coords_AC[1], -peri_coords_AC[0]])
radius_AC = np.sqrt(np.sum(center_coords_AC ** 2))

# Transform points back to orthonormal basis
center_coords_A = np.column_stack((np.dot(P_AB, center_coords_AB), np.dot(P_AC, center_coords_AC)))
center_coords = center_coords_A + np.array([x_coords[0], y_coords[0]])

# Create plot
plt.figure()
plt.scatter(x_coords, y_coords, marker='o', color='black', label='Known Points')
plt.scatter(center_coords[0, :], center_coords[1, :], marker='o', color='red', label='Observer Position')
for i in range(center_coords.shape[1]):
    plt.text(center_coords[0, i], center_coords[1, i], f'({center_coords[0, i]:.2f}, {center_coords[1, i]:.2f})', fontsize=7)
plt.xlim(min(x_coords) - np.std(x_coords) / 2, max(x_coords) + np.std(x_coords) / 2)
plt.ylim(min(y_coords) - np.std(y_coords) / 2, max(y_coords) + np.std(y_coords) / 2)
plt.gca().set_aspect('equal', adjustable='box')
plt.title('Determine position of observer\nIdentify the right intersection between the circles')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend()

# Draw circles
circle_AB = plt.Circle((center_coords[0, 0], center_coords[1, 0]), radius_AB, color='peru', fill=False)
circle_BC = plt.Circle((center_coords[0, 1], center_coords[1, 1]), radius_AB, color='seagreen', fill=False)
circle_AC = plt.Circle((center_coords[0, 1], center_coords[1, 1]), radius_AC, color='peru', fill=False)
circle_CA = plt.Circle((center_coords[0, 1], center_coords[1, 1]), radius_AC, color='seagreen', fill=False)

plt.gca().add_patch(circle_AB)
plt.gca().add_patch(circle_BC)
plt.gca().add_patch(circle_AC)
plt.gca().add_patch(circle_CA)

plt.show()
