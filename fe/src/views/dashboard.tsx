import { useContext, useEffect, useState } from "react";
import { FunctionComponent } from "react";
import Button from "../components/button";
import { SocketContext } from "../socket";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/confirm-modal";

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const [codeJoin, setCodeJoin] = useState("");
  const [description, setDescription] = useState("");
  const [confirmShow, setConfirmShow] = useState(false);
  const [confirmDisplay, setConfirmDisplay] = useState(false);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("join-room", ({ roomCode }) => {
      navigate("/room/" + roomCode);
    });
    socket.on("error-modal", (_description) => {
      setConfirmDisplay(true);
      setTimeout(() => {
        setConfirmShow(true);
      }, 10);
      setDescription(_description);
    });
    //eslint-disable-next-line
  }, [socket]);

  const handleCodeChange = (e: any) => {
    setCodeJoin(e.currentTarget.value.toUpperCase());
  };

  const createRoom = () => {
    socket.emit("create-room", { playerId: socket.id });
  };

  const checkIfRoomExists = () => {
    socket.emit("check-for-room", { roomCode: codeJoin, playerId: socket.id });
  };
  const handleKeypress = (e: any) => {
    if (e.key === "Enter" && codeJoin.length === 4) checkIfRoomExists();
  };

  const closeConfirmModal = () => {
    setConfirmShow(false);
    setTimeout(() => {
      setConfirmDisplay(false);
    }, 500);
  };

  return (
    <>
      <div className="content min-w-[270px] w-1/3 max-w-[400px] bg-blank bg-opacity-90 p-4 mx-auto mt-48 rounded">
        <div className="top flex flex-col items-center gap-4">
          <div className="header text-typography">
            Pridruži se sobi preko koda
          </div>
          <input
            className="input p-2 w-full rounded uppercase text-typography"
            placeholder="Upišite kod..."
            maxLength={4}
            onChange={(e) => handleCodeChange(e)}
            onKeyDown={(e) => handleKeypress(e)}
          ></input>
          <div className="mt-4">
            <Button
              onClickFunction={checkIfRoomExists}
              disabled={codeJoin.length !== 4}
            >
              Pridruži se
            </Button>
          </div>
        </div>
        <div className="divider flex h-6 my-4">
          <div className="h-3 border-b border-typography-light w-full"></div>
          <div className="w-fit px-2 text-typography">ili</div>
          <div className="h-3 border-b border-typography-light w-full"></div>
        </div>
        <div className="bottom flex flex-col items-center gap-4">
          <div>
            <Button onClickFunction={createRoom}>Napravi sobu</Button>
          </div>
        </div>
      </div>
      <ConfirmModal
        text={description}
        confirmDisplay={confirmDisplay}
        confirmShow={confirmShow}
        closeConfirmModal={closeConfirmModal}
      ></ConfirmModal>
    </>
  );
};

export default Dashboard;
