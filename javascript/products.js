import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import paginationComponents from './components/pagination.js';
import prodModal from './components/prodModal.js';
import delModal from './components/delModal.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'hexschoolvue';

let productModal = null;
let delProductModal = null;

createApp({
  data() {
    return {
      products: [],
      tempProduct: {
        imagesUrl: [],
      },
      pagination: {},
      isNew: false,
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    axios.defaults.headers.common.Authorization = token;
    this.checkAdmin();
  },
  methods: {
    checkAdmin() {
      const url = `${apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getData();
        })
        .catch((err) => {
          alert(err.data.message)
          window.location = 'index.html';
        })
    },
    getData(page = 1) {
      const url = `${apiUrl}/api/${apiPath}/admin/products?page=${page}`;

      axios.get(url)
        .then((response) => {
          const { products, pagination } = response.data;
          this.products = products;
          this.pagination = pagination;
        }).catch((err) => {
          alert(err.data.message);
          window.location = 'index.html';
        })
    },
    openModal(isNew, item) {
      if (isNew === 'new') {
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } else if (isNew === 'edit') {
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') {
        this.tempProduct = { ...item };
        delProductModal.show()
      }
    },
  },
})
  // 分頁元件
  .component('pagination', paginationComponents)
  // 產品新增/編輯元件
  .component('productModal', {
    template: prodModal,
    props: {
      product: {
        type: Object,
        default() {
          return {
            imagesUrl: [],
          }
        }
      },
      isNew: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        modal: null,
      };
    },
    mounted() {
      productModal = new bootstrap.Modal(document.getElementById('productModal'), {
        keyboard: false,
        backdrop: 'static'
      });
    },
    methods: {
      updateProduct() {
        // 新增商品
        let api = `${apiUrl}/api/${apiPath}/admin/product`;
        let httpMethod = 'post';
        // 當不是新增商品時則切換成編輯商品 API
        if (!this.isNew) {
          api = `${apiUrl}/api/${apiPath}/admin/product/${this.product.id}`;
          httpMethod = 'put';
        }

        axios[httpMethod](api, { data: this.product }).then((response) => {
          alert(response.data.message);
          this.hideModal();
          this.$emit('update');
        }).catch((error) => {
          alert(error.data.message);
        });
      },
      createImages() {
        this.product.imagesUrl = [];
        this.product.imagesUrl.push('');
      },
      openModal() {
        productModal.show();
      },
      hideModal() {
        productModal.hide();
      },
    },
  })
  // 產品刪除元件
  .component('delProductModal', {
    template: delModal,
    props: {
      item: {
        type: Object,
        default() {
          return {
          }
        }
      }
    },
    data() {
      return {
        modal: null,
      };
    },
    mounted() {
      delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
        keyboard: false,
        backdrop: 'static',
      });
    },
    methods: {
      delProduct() {
        axios.delete(`${apiUrl}/api/${apiPath}/admin/product/${this.item.id}`).then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.hideModal();
            this.$emit('update');
          } else {
            alert(response.data.message);
          }
        }).catch((error) => {
          alert(error.data.message);
        });
      },
      openModal() {
        delProductModal.show();
      },
      hideModal() {
        delProductModal.hide();
      },
    },
  })
  .mount('#app')