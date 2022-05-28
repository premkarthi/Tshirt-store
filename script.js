
const ProductJSON = 'https://geektrust.s3.ap-southeast-1.amazonaws.com/coding-problems/shopping-cart/catalogue.json'

var pagetype ;

const productList = document.querySelector('#productList')
const cartCount = document.querySelector('.cartCount');
const miniCartProducts = document.querySelector('.addedProducts');
const miniCartBlock = document.querySelector('.miniCart');
const cartBtn = document.querySelector('.cartBtn');
const closeBtn = document.querySelector('.close');
const totalPriceCart = document.querySelector('.totalPrice');
const miniAddCardBtn = document.querySelector('.miniAddCard')
const cartpageList = document.querySelector('.CartpageAddedSection');

const search = document.querySelector('.search')
const searchBtn = document.querySelector('.searchBtn')
const filetBtn = document.querySelector('.filter')
const filerSection = document.querySelector('.filterSection')


var productStore = []
var buttonsDom = []


class ProductStore {
    async fetchData(){
        try {
            let result = await fetch(ProductJSON).then(response => {
                return response.json()
            })
            return result
        } catch (error) {
            console.log("Some thing went wrong");
        }
    }
    
}

class UserInterface {
    createProduct(products){
        productList.innerHTML = ''
        products.forEach(product => {
                let html =  `<div class="productCard" id="product${product.id}">
                <div class="productImage" title="${product.type}">
                    <img src="${product.imageURL}" />
                </div>
                <div class="productTitle">${product.name} - <span class="gender" title="${product.gender}">${product.gender}</span></div>
                <div class="color ${product.color}" title="${product.color}"></div>
                <div class="productPrice">Rs ${product.price}</div>
                <button class="AddToCartBtn" data-id=${product.id}>Add to Cart</button>
            </div>`
    
            productList.insertAdjacentHTML('beforeend' , html)
        });
    }
    addToCartButtons(){
        const buttons = [...document.querySelectorAll('.AddToCartBtn')];
        buttonsDom = buttons
        buttons.forEach(button => {
            const id = button.dataset.id;
            const isCart = productStore.find(prod => prod.id === Number.parseInt(id))

            if(isCart){ 
                button.innerText = 'Product added'
                button.disabled  = true
                button.classList.add('disable')
            }
            button.addEventListener('click' , (e) =>{
                e.target.innerText  = 'Product added',
                e.target.disabled  = true,
                e.target.classList.add('disable')
                const cartItem = {...LocalStore.getProduct(id) , amount: 1}
                
                //save cartItem into empty array
                productStore = [...productStore, cartItem]

                console.log(productStore);
                //Store array to localstorage
                LocalStore.saveCartItems(productStore)

                //Calculate cart length and Product Price
                this.setcalValues(productStore)

                this.createCartElement(cartItem)

                // this.showMiniCart();
                
            });
        });
    }
 
    setcalValues(cartItems){
        let totalPrice = 0;
        let totalItems = 0;

        cartItems.forEach((item) =>{
            totalPrice += item.price * item.amount;
            totalItems += item.amount;
        })

        cartCount.innerHTML = totalItems
        totalPriceCart.innerHTML =  `Rs ${totalPrice}`
    }
    setUpMiniCartModal() {
        productStore = LocalStore.getCartItems();
        this.setcalValues(productStore);
        this.populateCart(productStore);
      
        closeBtn?.addEventListener('click' , this.closeMiniCart);
        
    }

    populateCart(products){
        products.forEach(product => this.createCartElement(product))
    }

    createCartElement(product){
        const div = document.createElement('div');
        div.classList.add('cartProduct')
        div.innerHTML= `
        <img src="${product.imageURL}" alt="">
        <div class="info">
            <h2>${product.name} <span>Rs ${product.price}</span></h2>
            <div class="qty">
                <button class="minus" data-id="${product.id}">-</button>
                <input type="number" value=${product.amount} class="quantity">
                <button class="plus" data-id="${product.id}">+</button>
            </div>
            <h5 data-id="${product.id}" class="remove">Remove</h5>
        </div>
        `
        miniCartProducts.append(div)
    }

    cartLogic(){
       miniCartProducts.addEventListener('click', (e) => {
        if(e.target.classList.contains('remove')){
            let id = Number.parseInt(e.target.dataset.id);
            this.removeItemCart(id);
            
            miniCartProducts.removeChild(e.target.parentElement.parentElement)
            
        }else if(e.target.classList.contains('plus')){
            let addAmount = e.target;
            let id  =   Number.parseInt(addAmount.dataset.id);

            let currentItem = productStore.find(item => item.id === id)

            currentItem.amount += 1;
            LocalStore.saveCartItems(productStore)
            this.setcalValues(productStore);

            addAmount.previousElementSibling.value = currentItem.amount
        }
        else if(e.target.classList.contains('minus')){
            let addAmount = e.target;
            let id  =   Number.parseInt(addAmount.dataset.id);

            let currentItem = productStore.find(item => item.id === id)

            currentItem.amount -= 1;
            
            if(currentItem.amount > 0){
                LocalStore.saveCartItems(productStore)
                this.setcalValues(productStore);
                addAmount.nextElementSibling.value = currentItem.amount
            }
            else{
                miniCartProducts.removeChild(e.target.parentElement.parentElement.parentElement)
                this.removeItemCart(id);
            }
        }
    })
    }
    removeItemCart(id){
        productStore = productStore.filter(item => item.id !== id);
        this.setcalValues(productStore)
        LocalStore.saveCartItems(productStore);

    }

    findButton(id){
        return buttonsDom.find(item => item.dataset.id == id)
    }

    showMiniCart(){
        miniCartBlock.classList.add('active')
    }

    closeMiniCart(){
         miniCartBlock.classList.remove('active');
    }

    cartpageLogics(){
        let products  = LocalStore.getCartItems();

        console.log(products);
    }
}


class LocalStore {
    static saveProducts(products){
        localStorage.setItem("Products" , JSON.stringify(products))
    }   
    
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("Products"))
        return products.find(prod => prod.id === Number.parseInt(id));
    } 

    static saveCartItems(items){
        localStorage.setItem("Cart" , JSON.stringify(items))
    }

    static getCartItems(){
      let cartItems =  localStorage.getItem("Cart")?JSON.parse(localStorage.getItem("Cart")) : [];
      return cartItems;
    }
}


class Filters{
    getValFromSearch = () =>{
            if(search.value.length > 1){
                let filterValue = search.value.toUpperCase();
                let productCard  = productList.querySelectorAll('.productCard');
 
                for (let i = 0; i < productCard.length; i++) {
                     let word = productCard[i].querySelector('.productTitle')
 
                     if(word.innerHTML.toUpperCase().indexOf(filterValue) > -1){
                         productCard[i].style.display= 'initial'
                     }
                     else{
                         productCard[i].style.display= 'none'
                     }
                }
            }
            else{
                let productCard  = productList.querySelectorAll('.productCard');
                for (let i = 0; i < productCard.length; i++) {
                    productCard[i].style.display= 'initial'
                }
            }

    }
}

document.addEventListener('DOMContentLoaded' , () => {
    document.body.classList.contains('mainpage') ? pagetype = 'mainpage' : pagetype = 'cartpage';
    
    cartBtn.addEventListener('click' , function() {
        window.location.href = 'cart.html'
    });


    if(pagetype == "mainpage"){
        const ui = new UserInterface();
        const products = new ProductStore();
        const filterCl = new Filters()
        ui.setUpMiniCartModal();
        
        products.fetchData().then(products => {
            ui.createProduct(products);
            LocalStore.saveProducts(products)
        }).then(() => {
            ui.addToCartButtons();
            ui.cartLogic()
        })
    
        searchBtn.addEventListener('click' , function() {
            filterCl.getValFromSearch()
        })
        
        var checkboxes =  document.querySelectorAll('input[type="radio"]')

        checkboxes.forEach(input => {
            input.addEventListener('change' , function(e){
                let productCard  = productList.querySelectorAll('.productCard');

                for (let i = 0; i < productCard.length; i++) {
                    let filterValue = e.target.id.toLowerCase();
                    var word2;
                    if(e.target.classList.contains('color')){
                         word2 = productCard[i].querySelector('.color').title
                    } 
                    else if(e.target.classList.contains('gender')){
                        word2 = productCard[i].querySelector('.gender').title
                    } 
                    else if(e.target.classList.contains('price')){
                        let word = productCard[i].querySelector('.productPrice').innerText;

                        let check = word.split(' ')[1];

                        if(check >= 450){
                            word2 = 500
                        }
                        else{
                            word2 = check
                        }
                    } 
                    else{
                        word2 = productCard[i].querySelector('.productImage').title
                    }


                    let word = word2;

                    if (this.checked) {
                        if(filterValue == 'all'){
                            productCard[i].style.display= 'block';
                        }
                     
                       else{
                            if(word.toLowerCase() == filterValue ){
                                productCard[i].style.display= 'initial';
                            }
                            else{
                                productCard[i].style.display= 'none'
                            }
                       }
                    }
            }
        })
        })

        filetBtn.addEventListener('click' , function () {
            filerSection.classList.toggle('active')
        })
    }
    else{
        const ui = new UserInterface();
        ui.setUpMiniCartModal();
        ui.addToCartButtons();
        ui.cartLogic()
        ui.cartpageLogics()
    }
    
})




