import { FunctionComponent } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "../views/dashboard";
import Room from "../views/room";
import Rules from "../views/rules";
import Training from "../views/training";
import Header from "./header";
import { SocketContext, socket } from "../socket";

interface RouterProps {}

const Router: FunctionComponent<RouterProps> = () => {
  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Header />
        <div className="body h-[100vh] bg-[url('./assets/bg.gif')] w-full bg-cover absolute top-0 -z-10">
          <div className="body h-[100vh] bg-black bg-opacity-40 w-full bg-cover absolute top-0 -z-10" />
          <Routes>
            <Route path="/room/:id" element={<Room />}></Route>
            <Route path="/pravila" element={<Rules />}></Route>
            <Route path="/trening" element={<Training />}></Route>
            <Route path="/" element={<Dashboard />}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </SocketContext.Provider>
  );
};

export default Router;
