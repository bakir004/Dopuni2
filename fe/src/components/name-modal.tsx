import { FunctionComponent } from "react";
import Button from "./button";

interface NameModalProps {
  show: boolean,
  display: boolean,
  handleNameChange: (e: any) => void,
  handleKeypress: (e: any) => void,
  closeNameModal: () => void,
  name: string
}

const NameModal: FunctionComponent<NameModalProps> = (props) => {
  return (
    <>
      <div
        className={`modal-overlay transition duration-500 absolute top-0 left-0 h-[100vh] w-full bg-black bg-opacity-70 ${
          !props.show ? "opacity-0" : "opacity-100"
        } ${!props.display ? "hidden" : ""}`}
      ></div>
      <div
        className={`modal text-typography transition duration-500 flex flex-col items-center p-4 bg-slate-300 rounded w-11/12 max-w-[300px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
          !props.show ? "opacity-0" : "opacity-100"
        } ${!props.display ? "hidden" : ""}`}
      >
        <div className="header">Unesite svoje ime:</div>
        <div className="subtitle text-xs italic">(3 do 12 karaktera)</div>
        <input
          className="input p-2 w-full rounded text-typography my-4"
          placeholder="Upišite svoje ime ovdje..."
          autoFocus
          maxLength={12}
          onChange={(e) => props.handleNameChange(e)}
          onKeyDown={(e) => props.handleKeypress(e)}
        ></input>
        <Button onClickFunction={props.closeNameModal} disabled={props.name.length < 3}>
          Potvrdi
        </Button>
      </div>
    </>
  );
};

export default NameModal;
