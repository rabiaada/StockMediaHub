import { User, InsertUser, Image, InsertImage, CartItem, InsertCartItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image operations
  getImages(): Promise<Image[]>;
  getImagesByType(type: string): Promise<Image[]>;
  getImageById(id: number): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private cartItems: Map<number, CartItem>;
  private currentUserId: number;
  private currentImageId: number;
  private currentCartItemId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.cartItems = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
    this.currentCartItemId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample images
    this.initializeSampleImages();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getImages(): Promise<Image[]> {
    return Array.from(this.images.values());
  }

  async getImagesByType(type: string): Promise<Image[]> {
    return Array.from(this.images.values()).filter(img => img.type === type);
  }

  async getImageById(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const image: Image = { ...insertImage, id };
    this.images.set(id, image);
    return image;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  private initializeSampleImages() {
    const sampleImages: InsertImage[] = [
      {
        title: "Medical Professional at Work",
        description: "Healthcare professional in clinical setting",
        type: "photo",
        url: "https://images.unsplash.com/photo-1599814516142-dbecedc5eb32",
        price: "49.99",
        tags: ["medical", "healthcare", "professional"],
        sellerId: 1,
        metadata: { width: 1920, height: 1080, format: "jpg" }
      },
      // Add more sample images here...
    ];

    sampleImages.forEach(img => {
      const id = this.currentImageId++;
      this.images.set(id, { ...img, id });
    });
  }
}

export const storage = new MemStorage();
