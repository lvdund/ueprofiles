import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

function DeleteConfirmationModal({ show, handleClose, handleConfirm, supi }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm to Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure to delete UE Profile with SUPI: <strong>{supi}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleConfirm}>
          Delete
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  supi: PropTypes.string.isRequired,
};

export default DeleteConfirmationModal;
