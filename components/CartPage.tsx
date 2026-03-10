
import React from 'react';
import { Course, CartItem, EnrolledCourse } from '../types';

interface CartPageProps {
  cartItems: CartItem[];
  wishlistCourses: Course[];
  purchaseHistory: EnrolledCourse[];
  onRemoveFromCart: (id: string) => void;
  onAddToCart: (course: Course) => void;
  onRemoveFromWishlist: (e: React.MouseEvent, id: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
  onSelectCourse: (course: Course) => void;
}

const CartPage: React.FC<CartPageProps> = ({ 
  cartItems, 
  wishlistCourses,
  purchaseHistory, 
  onRemoveFromCart, 
  onAddToCart,
  onRemoveFromWishlist,
  onCheckout, 
  onBrowse,
  onSelectCourse
}) => {
  const isDiscountActive = cartItems.length >= 3;
  const originalTotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const cartTotal = isDiscountActive ? originalTotal * 0.5 : originalTotal;
  const savings = originalTotal - cartTotal;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2 text-left">
          <h1 className="text-5xl font-black tracking-tighter leading-none font-display">Your Shop</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Manage your cart and unlock high-impact bundles.</p>
        </div>
      </div>

      <div className={`p-8 md:p-12 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-700 border-2 ${isDiscountActive ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/10' : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800 shadow-xl'}`}>
         <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className={`size-20 md:size-24 rounded-[32px] flex items-center justify-center transition-all shrink-0 ${isDiscountActive ? 'bg-primary text-white shadow-xl scale-110' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
               <span className="material-symbols-outlined text-4xl md:text-5xl font-black">{isDiscountActive ? 'celebration' : 'shopping_bag'}</span>
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl md:text-3xl font-black tracking-tighter font-display">Bundle Offer Status</h3>
               <p className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-md">
                 {isDiscountActive 
                    ? "Congratulations! You've unlocked 50% OFF on all courses in your cart." 
                    : `Add ${3 - cartItems.length} more courses to unlock the massive 50% bundle discount.`}
               </p>
            </div>
         </div>
         {isDiscountActive ? (
           <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-primary tracking-[0.2em]">You Saved</p>
                <p className="text-3xl font-black text-green-500 font-display">-${savings.toFixed(2)}</p>
             </div>
             <div className="size-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                <span className="material-symbols-outlined text-2xl font-black">check</span>
             </div>
           </div>
         ) : (
           <div className="flex gap-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`size-4 rounded-full transition-all duration-500 ${cartItems.length >= step ? 'bg-primary shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-125' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              ))}
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
              <h2 className="text-3xl font-black font-display flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
                My Items ({cartItems.length})
              </h2>
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="group bg-white dark:bg-surface-dark p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-8 hover:shadow-2xl transition-all duration-500">
                    <div className="w-full sm:w-52 h-32 rounded-3xl overflow-hidden cursor-pointer shrink-0" onClick={() => onSelectCourse(item)}>
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-primary tracking-[0.2em]">{item.category}</p>
                          <h3 className="font-black text-2xl leading-tight hover:text-primary cursor-pointer transition-colors font-display" onClick={() => onSelectCourse(item)}>{item.title}</h3>
                        </div>
                        <div className="text-right">
                          {isDiscountActive && <p className="text-xs text-slate-400 line-through font-bold">${item.price}</p>}
                          <p className="text-2xl font-black text-primary font-display">${isDiscountActive ? (item.price * 0.5).toFixed(2) : item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 mt-6">
                        <button onClick={() => onRemoveFromCart(item.id)} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-2 uppercase tracking-widest transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                          Remove
                        </button>
                        <button onClick={() => { onAddToCart(item); onCheckout(); }} className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-2 uppercase tracking-widest transition-colors">
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                          Buy Individual
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-slate-900 text-white p-10 md:p-16 rounded-[60px] shadow-2xl space-y-10 mt-12 border border-white/5 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><span className="material-symbols-outlined text-[200px] font-black">payments</span></div>
                  <div className="relative z-10 space-y-6">
                    {isDiscountActive && (
                      <div className="space-y-4">
                        <div className="flex justify-between text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                          <span>Order Subtotal</span>
                          <span className="line-through">${originalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                          <span>Special Bundle Savings</span>
                          <span>-${savings.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-white/10 pt-10 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Grand Total Payable</p>
                        <p className="text-5xl md:text-7xl font-black tracking-tighter font-display">${cartTotal.toFixed(2)}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 italic pb-2">Includes all taxes & platform fees.</p>
                    </div>
                  </div>
                  <button onClick={onCheckout} className="w-full py-6 md:py-8 bg-primary text-white font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl text-xl tracking-[0.2em] relative z-10 uppercase">
                    COMPLETE CHECKOUT
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center bg-white dark:bg-surface-dark rounded-[60px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                <div className="size-28 bg-slate-50 dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-6xl">shopping_cart_off</span>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black font-display">Your cart is feeling light.</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Add some courses to your cart to begin your mastery journey.</p>
                </div>
                <button onClick={onBrowse} className="px-12 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-all uppercase tracking-widest text-sm">Explore Catalog</button>
              </div>
            )}
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-black font-display flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
              Saved Tracks ({wishlistCourses.length})
            </h2>
            {wishlistCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {wishlistCourses.map((course) => (
                  <div key={course.id} className="group bg-white dark:bg-surface-dark p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col gap-6 hover:shadow-2xl transition-all duration-500 text-left">
                    <div className="relative h-48 rounded-3xl overflow-hidden cursor-pointer" onClick={() => onSelectCourse(course)}>
                      <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-primary text-sm font-black px-4 py-2 rounded-2xl shadow-xl">
                        ${course.price}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-xl leading-tight line-clamp-1 font-display">{course.title}</h4>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                        <button onClick={(e) => onRemoveFromWishlist(e, course.id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors">Remove</button>
                        <button onClick={() => onAddToCart(course)} className="px-6 py-3 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-white transition-all">Move to Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] text-slate-400 uppercase font-bold text-[10px] tracking-[0.3em] bg-white dark:bg-surface-dark shadow-xl">No saved items found.</div>
            )}
          </section>
        </div>

        <div className="space-y-8 text-left">
          <h2 className="text-3xl font-black font-display flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="material-symbols-outlined text-primary text-3xl">history</span>
            Recent Orders
          </h2>
          <div className="space-y-6">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map((order) => (
                <div key={order.id} className="bg-white dark:bg-surface-dark p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex gap-5">
                    <img src={order.imageUrl} className="size-20 rounded-2xl object-cover shadow-lg" alt="" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-black text-base line-clamp-1 leading-tight font-display">{order.title}</h4>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">ID: #{order.orderId || '72941'}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"><span>Method</span><span className="text-slate-900 dark:text-slate-200">{order.paymentMethod || 'Credit Card'}</span></div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"><span>Date</span><span className="text-slate-900 dark:text-slate-200">{order.purchaseDate || 'Mar 1, 2025'}</span></div>
                  </div>
                  <button onClick={() => onSelectCourse(order)} className="w-full py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">Receipt & Details</button>
                </div>
              ))
            ) : (
              <div className="p-16 text-center bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">No order history</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
