// Madhav palette: Jewel Teal #004C56 (ink), Antique Gold #C5A15B, Royal Amethyst #48204F, Warm Ivory #F3EBDD (cream).
// The same four colours exist as CSS variables in src/index.css (--teal, --gold, --amethyst, --ivory).
// The type scale is deliberately small and calm: page headings ~28px, body 15px, labels 12-13px.
export default {
  content:['./index.html','./src/**/*.{js,jsx}'],
  theme:{
    fontSize:{
      xs:['.75rem',{lineHeight:'1.05rem'}],sm:['.8438rem',{lineHeight:'1.2rem'}],base:['.9375rem',{lineHeight:'1.4rem'}],
      lg:['1.0625rem',{lineHeight:'1.5rem'}],xl:['1.1875rem',{lineHeight:'1.6rem'}],'2xl':['1.3125rem',{lineHeight:'1.7rem'}],
      '3xl':['1.5625rem',{lineHeight:'1.9rem'}],'4xl':['1.75rem',{lineHeight:'2.05rem'}],
    },
    extend:{
      colors:{
        ink:{DEFAULT:'#004C56',soft:'#2F6A72',mute:'#456B72'},
        cream:{DEFAULT:'#F3EBDD',light:'#FAF6EC',deep:'#E2D5BA'},
        gold:{DEFAULT:'#C5A15B',dark:'#A9863F',text:'#7A5C1C',tint:'#F1E6CC'},
        amethyst:{DEFAULT:'#48204F',dark:'#331638',tint:'#EADFEC'},
      },
      fontFamily:{
        serif:['"Cormorant Garamond"','Georgia','serif'],
        sans:['Inter','system-ui','-apple-system','"Segoe UI"','sans-serif'],
        deva:['"Noto Serif Devanagari"','"Noto Serif Bengali"','serif'],
      },
    },
  },
};
