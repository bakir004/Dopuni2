import { FunctionComponent } from "react";
import Button from "./button";

interface ConfirmModalProps {
  confirmShow: boolean,
  confirmDisplay: boolean,
  closeConfirmModal: () => void,
  text: string
}

const ConfirmModal: FunctionComponent<ConfirmModalProps> = (props) => {
  return (
    <>
      <div
        className={`modal-overlay transition duration-500 absolute top-0 left-0 h-[100vh] w-full bg-black bg-opacity-70 ${
          !props.confirmShow ? "opacity-0" : "opacity-100"
        } ${!props.confirmDisplay ? "hidden" : ""}`}
      ></div>
      <div
        className={`modal text-typography transition duration-500 flex flex-col items-center p-4 bg-slate-300 rounded w-11/12 max-w-[300px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
          !props.confirmShow ? "opacity-0" : "opacity-100"
        } ${!props.confirmDisplay ? "hidden" : ""}`}
      >
        <div className="header font-bold mb-2">{":("}</div>
        <div className="desc ">{props.text}</div>
        <Button onClickFunction={props.closeConfirmModal}>
          U redu
        </Button>
      </div>
    </>
  );
};

export default ConfirmModal;
