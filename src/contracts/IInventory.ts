/**
 * Contract defining catalog, product, and cart interactions across Web and Mobile platforms.
 */
export interface IInventory {
  /**
   * Add a product to the cart by its displayed name.
   * @param productName Display name of the product (e.g. 'Sauce Labs Backpack')
   */
  addItemToCart(productName: string): Promise<void>;

  /**
   * Remove a product from the cart by its displayed name.
   * @param productName Display name of the product
   */
  removeItemFromCart(productName: string): Promise<void>;

  /**
   * Retrieve the current item count displayed on the shopping cart badge.
   */
  getCartBadgeCount(): Promise<number>;

  /**
   * Navigate to the cart view.
   */
  openCart(): Promise<void>;

  /**
   * Retrieve the displayed price string for a specific product.
   * @param productName Display name of the product
   */
  getItemPrice(productName: string): Promise<string>;
}

