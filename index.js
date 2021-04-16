// variables

const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

// popup variables
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

//cart
let cart = []
//buttons
let buttonsDOM = []

//getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items
            products = products.map(item => {
                const { title, price } = item.fields
                const { id } = item.sys
                const image = item.fields.image.fields.file.url
                return { title, price, id, image }
            })
            return products



        } catch (error) {
            console.log(error)
        }

    }

}

//display products
class UI {
    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
            <!-- single producst -->
            <article class="">
               <div class="img-container">
                   <img src=${product.image}
                   class="product-img">
                   <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>
                       add to cart
                   </button>
               </div>
               <h3>${product.title}</h3>
               <h4>${product.price}</h4>

               <button data-modal-target="#modal" data-id=${product.id}>Guitar Info</button>
                <div class="modal" id="modal">
                    <div class="modal-header">
                    <div class="title">Guitar Detail</div>
                    <button data-close-button class="close-button">&times;</button>
                    </div>
                    <div class="modal-body">
                    Fender coustic guitar 1999$
                    </div>
                </div>
                <div id="overlay"></div>

             
           </article>
           <!-- end of single producst -->  
            
            `
        })
        productsDOM.innerHTML = result
    }
    getDataModelTargetButton() {//popup modal
        const openModalButtons = document.querySelectorAll('[data-modal-target]')
        const closeModalButtons = document.querySelectorAll('[data-close-button]')
        const overlay = document.getElementById('overlay')
        buttonsDOM = openModalButtons

        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.querySelector(button.dataset.modalTarget)
                openModal(modal)
            })
        })
        console.log(openModalButtons)

        overlay.addEventListener('click', () => {
            const modals = document.querySelectorAll('.modal.active')
            modals.forEach(modal => {
                closeModal(modal)
            })
        })

        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal')
                closeModal(modal)
            })
        })

        function openModal(modal) {
            if (modal == null) return
            modal.classList.add('active')
            overlay.classList.add('active')
        }

        function closeModal(modal) {
            if (modal == null) return
            modal.classList.remove('active')
            overlay.classList.remove('active')
        }
       

    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = 'In Cart'
                button.disabled = true
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart'
                event.target.disabled = true
                // uzimam produkte iz produkta
                let cartItem = { ...Storage.getProduct(id), amount: 1 }
                // dodajemo produkte u kartici
                cart = [...cart, cartItem]

                //pamtimo karticu u lokalnom storedzu
                Storage.saveCart(cart)
                //postavljamo vrednost kartice
                this.setCartValues(cart)
                //prikazujemo u kartici stvari
                this.addCartItem(cartItem)
                //prikazujemo karticu 
                this.showCart()
            })

        })
    }
    setCartValues(cart) {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal

    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = ` <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id} >remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up"  data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down"  data-id=${item.id}></i>
        </div>`
        cartContent.appendChild(div)
        // console.log(cartContent)
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }

    setupAPP() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCard)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item))

    }

    hideCard() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        console.log(cartContent.children)

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCard()
    }

    removeItem(id) {
        cart = cart.filter(item => item.id != id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class = "fas fa-shopping-cart">add to cart</i>`
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

//local storage

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()
    //setup aplicaton
    ui.setupAPP()
    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
        ui.getDataModelTargetButton()
    })
})



