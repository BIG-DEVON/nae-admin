// Shared tiny alias
export type ID = number | string;

/** /gallery/ item */
export interface Gallery {
  id: ID;
  title: string;
  position: number;
  // Some old UIs referenced `description`; keep it optional to avoid TS errors
  description?: string | null;
}

/** Home gallery banner */
export interface HomeGallery {
  id: ID;
  name: string;
  title: string;
  position: number;
  image_url: string; // server field for the uploaded image url
}

/** ----- Inputs for Admin Actions (mirror Postman) ----- */

// POST /gallery-actions/home-gallery/ (formdata) with type=create
export interface CreateHomeGalleryInput {
  type: 'create';
  name: string;
  title: string;
  position: number;
  image: File;
}

// PATCH /gallery-actions/home-gallery/ (json)
export interface UpdateHomeGalleryInput {
  id: ID;
  name?: string;
  title?: string;
  position?: number;
}

// POST /gallery-actions/home-gallery/ (formdata) with type=edit-image
export interface EditHomeGalleryImageInput {
  type: 'edit-image';
  id: ID;
  image: File;
}
