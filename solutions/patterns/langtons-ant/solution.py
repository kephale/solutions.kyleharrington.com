###album catalog: solutions.computational.life

from album.runner.api import get_args, setup

def run():
    import numpy as np
    import napari
    from qtpy.QtCore import QTimer

    class LangtonsAnt:
        def __init__(self, grid_size):
            self.grid_size = grid_size
            self.grid = np.zeros((grid_size, grid_size), dtype=np.uint8)
            self.ant_pos = np.array([grid_size // 2, grid_size // 2])
            self.directions = np.array([[0, 1], [1, 0], [0, -1], [-1, 0]])  # Right, Down, Left, Up
            self.ant_dir = 0  # Start facing "Right"
            self.ant_color = [255, 0, 0]  # Red color for the ant

        def step(self):
            current_cell = self.grid[self.ant_pos[0], self.ant_pos[1]]

            # Turn the ant
            if current_cell == 0:
                self.ant_dir = (self.ant_dir + 1) % 4  # Turn right
            else:
                self.ant_dir = (self.ant_dir - 1) % 4  # Turn left

            # Flip the color of the current cell
            self.grid[self.ant_pos[0], self.ant_pos[1]] = 1 - current_cell

            # Move the ant forward
            self.ant_pos += self.directions[self.ant_dir]

            # Handle wrapping around the edges of the grid
            self.ant_pos = self.ant_pos % self.grid_size

        def get_grid_with_ant(self):
            # Create a copy of the grid and add the ant's position
            grid_with_ant = np.stack([self.grid] * 3, axis=-1).astype(np.uint8) * 255  # Convert grid to RGB
            grid_with_ant[self.ant_pos[0], self.ant_pos[1]] = self.ant_color  # Set the ant's position to red
            return grid_with_ant

    grid_size = 512
    ant = LangtonsAnt(grid_size)

    viewer = napari.Viewer()
    layer = viewer.add_image(ant.get_grid_with_ant(), contrast_limits=(0, 255), rgb=True)

    def update_frame():
        ant.step()
        layer.data = ant.get_grid_with_ant()

    # Use a QTimer to periodically call the update function
    timer = QTimer()
    timer.timeout.connect(update_frame)
    timer.start(50)

    napari.run()

setup(
    group="patterns",
    name="langtons-ant",
    version="0.0.1",
    title="Langton's Ant in Napari",
    description="An Album solution that simulates Langton's Ant and displays the resulting pattern using Napari.",
    authors=["Kyle Harrington"],
    cite=[{"text": "Langton's Ant by Chris Langton.", "url": "https://en.wikipedia.org/wiki/Langton%27s_ant"}],
    tags=["langtons-ant", "pattern", "python", "napari"],
    license="MIT",
    covers=[{
        "description": "Langton's Ant Pattern Generation cover image.",
        "source": "cover.png"
    }],
    album_api_version="0.3.1",
    args=[],
    run=run,
    dependencies={
        "parent": {
            "group": "environments",
            "name": "napari",
            "version": "0.0.5"
        }
    }
)
