"use server";

import fs from 'fs';
import path from 'path';

export interface SlideOption {
  filename: string;
  path: string;
  title: string;
}

export async function getAvailableSlides() {
  const slidesDir = path.join(process.cwd(), 'public', 'slides');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(slidesDir)) {
      return { success: true, slides: [] };
    }

    const files = await fs.promises.readdir(slidesDir);
    const slides: SlideOption[] = files
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        filename: file,
        path: `/slides/${file}`,
        // Create a more readable title from filename
        title: file
          .replace('.html', '')
          .replace(/-/g, ' ')
          .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
      }));
      
    return { success: true, slides };
  } catch (error) {
    console.error("Error reading slides directory:", error);
    return { success: false, error: "Error al listar las diapositivas", slides: [] };
  }
}
