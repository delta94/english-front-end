import React from "react";
import TestingTrial from "./TestingTrial";
// reactstrap components
import {
  Container,
} from "reactstrap";
import Features from "./Features";
import Testimonials from "./Testimonials";
import Pricing from "./Pricing";
import ContactUs from "./ContactUs";

// core components
interface  HomePageProps{

}
const HomePage : React.FC<HomePageProps> = ({


}) => {
    return (
        <>
          <div className="section section-basic" id="home-page">
                <TestingTrial/>
                <Testimonials/>
                <Features/>
                <Pricing/>
                <ContactUs/>
          </div>
        </>
      );
}


export default HomePage;
