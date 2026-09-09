if (!customElements.get('product-card-swatch')) {
  customElements.define(
    'product-card-swatch',
    class ProductCardSwatch extends HTMLElement {
      constructor() {
        super();
        this.card = this.closest('.test2-pc');
        this.image = this.card.querySelector('.test2-pc__image');
        this.priceNow = this.card.querySelector('.test2-pc__price-now');
        this.priceWas = this.card.querySelector('.test2-pc__price-was');
        this.variantLinks = this.card.querySelectorAll('.test2-pc__variant-link');
        this.quickAdd = this.card.querySelector('[data-quick-add]');
        this.swatches = Array.from(this.querySelectorAll('.test2-pc__swatch'));

        this.swatches.forEach((swatch) => {
          swatch.addEventListener('click', () => this.selectSwatch(swatch));
        });
      }

      selectSwatch(swatch) {
        if (swatch.classList.contains('is-selected')) return;

        this.swatches.forEach((s) => {
          s.classList.remove('is-selected');
          s.setAttribute('aria-pressed', 'false');
        });
        swatch.classList.add('is-selected');
        swatch.setAttribute('aria-pressed', 'true');

        const available = swatch.dataset.available === 'true';
        const variantId = swatch.dataset.variantId;
        const imageUrl = swatch.dataset.image;
        const price = swatch.dataset.price;
        const compareAt = swatch.dataset.compareAt;
        const href = swatch.dataset.href;

        if (imageUrl && this.image && this.image.src !== imageUrl) {
          this.image.style.opacity = '0';
          window.setTimeout(() => {
            this.image.src = imageUrl;
            this.image.style.opacity = '1';
          }, 120);
        }

        if (this.priceNow && price) this.priceNow.textContent = price;
        if (this.priceWas) {
          if (compareAt) {
            this.priceWas.textContent = compareAt;
            this.priceWas.hidden = false;
          } else {
            this.priceWas.hidden = true;
          }
        }

        if (href) {
          this.variantLinks.forEach((link) => {
            link.href = href;
          });
        }

        if (this.quickAdd) {
          this.quickAdd.dataset.variantId = variantId;
          this.quickAdd.disabled = !available;
          this.quickAdd.setAttribute('aria-label', available ? 'Quick add' : 'Sold out');
          this.quickAdd.classList.remove('is-error');
        }
      }
    }
  );
}

if (!customElements.get('product-card-quick-add')) {
  customElements.define(
    'product-card-quick-add',
    class ProductCardQuickAdd extends HTMLElement {
      constructor() {
        super();
        this.button = this.querySelector('[data-quick-add]');
        if (!this.button) return;
        this.isAdding = false;
        this.button.addEventListener('click', this.onClick.bind(this));
      }

      onClick() {
        if (this.isAdding || this.button.disabled) return;
        this.isAdding = true;
        this.button.classList.add('is-loading');
        this.button.classList.remove('is-error');

        const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        const body = JSON.stringify({
          id: this.button.dataset.variantId,
          quantity: 1,
          sections: cart ? cart.getSectionsToRender().map((section) => section.id) : [],
          sections_url: window.location.pathname,
        });

        const config = fetchConfig('javascript');
        config.body = body;

        fetch(`${window.routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              throw new Error(response.description || response.message || 'Could not add to cart');
            }

            if (cart) {
              cart.renderContents(response);
            }

            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'product-card-quick-add',
              productVariantId: this.button.dataset.variantId,
              cartData: response,
            });

            this.showToast(this.dataset.successMessage || 'Added to cart');
          })
          .catch((error) => {
            console.error(error);
            this.button.classList.add('is-error');
            this.showToast(this.dataset.errorMessage || "Couldn't add to cart — try again", true);
          })
          .finally(() => {
            this.button.classList.remove('is-loading');
            this.isAdding = false;
          });
      }

      showToast(message, isError) {
        let toast = document.querySelector('[data-test2-cart-toast]');
        if (!toast) {
          toast = document.createElement('div');
          toast.setAttribute('data-test2-cart-toast', '');
          toast.className = 'test2-cart-toast';
          toast.setAttribute('role', 'status');
          toast.setAttribute('aria-live', 'polite');
          toast.hidden = true;
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.toggle('is-error', Boolean(isError));
        toast.hidden = false;
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
          toast.hidden = true;
        }, 2200);
      }
    }
  );
}
