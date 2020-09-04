/*!

=========================================================
* Now UI Dashboard React - v1.4.0
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/*eslint-disable*/
import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

import logo from "../../logo-white.svg";

var ps: PerfectScrollbar;
interface SidebarProps {
  location?: any
  refs?: React.Ref<HTMLElement>
  backgroundColor: any
  routes: any
}
class Sidebar extends React.Component<SidebarProps> {
  constructor(props: Readonly<SidebarProps>) {
    super(props);
    // this.activeRoute.bind(this);
  }
  // verifies if routeName is the one active (in browser input)
  // activeRoute(routeName: any) {
  //   return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  // }
  sidebar = React.createRef<HTMLDivElement>();
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1 && this.sidebar.current) {
      ps = new PerfectScrollbar(this.sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }
  render() {
    return (
      <div className="sidebar">
        <div className="logo">
          <a
            href="https://www.creative-tim.com?ref=nudr-sidebar"
            className="simple-text logo-mini"
            target="_blank"
          >
            <div className="logo-img">
              <img src={logo} alt="react-logo" />
            </div>
          </a>
          <a
            href="https://www.creative-tim.com?ref=nudr-sidebar"
            className="simple-text logo-normal"
            target="_blank"
          >
            Omega English
          </a>
        </div>
        <div className="sidebar-wrapper" ref={this.sidebar}>
          <Nav>
            {this.props.routes.map((prop: { redirect: any; layout: any; path: any; pro: any; icon: string; name: React.ReactNode; }, key: string | number | undefined) => {
              if (prop.redirect) return null;
              return (
                <li
                  className={''}
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={"now-ui-icons " + prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            })}
          </Nav>
        </div>
      </div>
    );
  }
}

export default Sidebar;