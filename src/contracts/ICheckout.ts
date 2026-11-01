/**
 * Contract defining checkout and order completion interactions across Web and Mobile platforms.
 */
export interface ICheckout {
  /**
   * Enter customer shipping information on the checkout form.
   * @param firstName Customer first name
   * @param lastName Customer last name
   * @param postalCode Customer postal/zip code
   */
  enterShippingDetails(firstName: string, lastName: string, postalCode: string): Promise<void>;

  /**
   * Proceed through the checkout overview and complete the order.
   */
  finishCheckout(): Promise<void>;

  /**
   * Retrieve the order completion confirmation header text.
   */
  getConfirmationHeader(): Promise<string>;
}

