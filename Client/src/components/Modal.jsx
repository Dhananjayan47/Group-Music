import {Button,Modal} from "react-bootstrap"

const MyModal = ({show,
    onHide,
    title = "Confirm",
    content,
    confirmText = "OK",
    onConfirm,}) => {


    return ( <Modal 
        show={show}
        onHide={onHide}
        centered
    >
          <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{content}</p>
      </Modal.Body>

      <Modal.Footer >
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        {confirmText==="?" ?<></> :<Button variant="danger" onClick={onConfirm}>{confirmText}</Button>}
      </Modal.Footer>
    </Modal> );
}
 
export default MyModal;