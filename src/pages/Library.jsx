import {Route,Routes} from 'react-router-dom';
import Index from './library/Index';import Category from './library/Category';import Detail from './library/Detail';
import {Favourites,MyMantras} from './library/Collections';import CustomForm from './library/CustomForm';
// Static routes are matched before the dynamic ":id" text route.
export default function Library(){return <Routes>
<Route index element={<Index/>}/><Route path="favourites" element={<Favourites/>}/><Route path="my-mantras" element={<MyMantras/>}/>
<Route path="category/:cat" element={<Category/>}/><Route path="custom/new" element={<CustomForm/>}/><Route path="custom/:id/edit" element={<CustomForm/>}/>
<Route path=":id" element={<Detail/>}/><Route path="*" element={<Index/>}/></Routes>}
