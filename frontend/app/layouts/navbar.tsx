import {Link, NavLink} from "react-router";

export default function Navbar() {
    return (
        <>
            <div className="navbar">
                <Link to="/"></Link>
                <NavLink to="/jobs">Jobs</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <NavLink to="/dashboard">Dashboard </NavLink>
            </div>
        </>
    )
}