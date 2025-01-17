import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../../api';
import { toast } from 'react-toastify';
import { Modal, Button, Form, Row, Col} from 'react-bootstrap';
import { getToken } from '../../utils/auth';

function GenerateUEProfileForm({ selectedProfile, onClose, refreshProfiles }) {
  const [formData, setFormData] = useState({
    num_ues: 1,
    plmnid: { mcc: '', mnc: '' },
    ueConfiguredNssai: [{ sst: 0, sd: '' }],
    ueDefaultNssai: [{ sst: 0, sd: '' }],
    integrity: { IA1: true, IA2: true, IA3: true },
    ciphering: { EA1: true, EA2: true, EA3: true },
    uacAic: { mps: false, mcs: false },
    uacAcc: {
      normalClass: 0,
      class11: false,
      class12: false,
      class13: false,
      class14: false,
      class15: false,
    },
  });

  useEffect(() => {
    if (selectedProfile) {
      setFormData({
        num_ues: 1, 
        plmnid: selectedProfile.plmnid || { mcc: '', mnc: '' },
        ueConfiguredNssai: selectedProfile.ueConfiguredNssai || [{ sst: 0, sd: '' }],
        ueDefaultNssai: selectedProfile.ueDefaultNssai || [{ sst: 0, sd: '' }],
        integrity: selectedProfile.integrity || { IA1: false, IA2: false, IA3: false },
        ciphering: selectedProfile.ciphering || { EA1: false, EA2: false, EA3: false },
        uacAic: selectedProfile.uacAic || { mps: false, mcs: false },
        uacAcc: selectedProfile.uacAcc || {
          normalClass: 0,
          class11: false,
          class12: false,
          class13: false,
          class14: false,
          class15: false,
        },
      });
    }
  }, [selectedProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Parse number inputs to integers
    if (type === 'number') {
      newValue = parseInt(value, 10);
      if (isNaN(newValue)) {
        newValue = 0; // Default value or handle as needed
      }
    }

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = newValue;
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[arrayName]];
      updatedArray[index][field] = value;
      return {
        ...prevData,
        [arrayName]: updatedArray,
      };
    });
  };

  const addSlice = (arrayName) => {
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: [...prevData[arrayName], { sst: 0, sd: '' }],
    }));
  };

  const removeSlice = (arrayName, index) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[arrayName]];
      updatedArray.splice(index, 1);
      return {
        ...prevData,
        [arrayName]: updatedArray,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      // **Debugging:** Check the data being submitted
      console.log('Submitting formData:', formData);

      // **Check required fields**
      if (!formData.plmnid.mcc || !formData.plmnid.mnc) {
        toast.error('MCC and MNC of the PLMN ID are compulsory.');
        return;
      }

      // **Create UE Profiles via the generate endpoint**
      const payload = {
        num_ues: formData.num_ues,
        plmnid: formData.plmnid,
        ueConfiguredNssai: formData.ueConfiguredNssai,
        ueDefaultNssai: formData.ueDefaultNssai,
        integrity: formData.integrity,
        ciphering: formData.ciphering,
        uacAic: formData.uacAic,
        uacAcc: formData.uacAcc,
        integrityMaxRate: formData.integrityMaxRate,
      };

      await axios.post('/ue_profiles/generate', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`${formData.num_ues} UE Profile(s) generated successfully.`);
      refreshProfiles();
      onClose();
    } catch (error) {
      console.error('Error saving profiles:', error);
      const errorMsg = error.response?.data?.error || 'An error occurred while saving the UE Profiles.';
      toast.error(errorMsg);
    }
  };

  return (
    <>
      {/* Modal */}
      <Modal show onHide={onClose} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProfile ? 'Update UE Profile' : 'Generate UE Profiles'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Number of UE Profiles */}
            <Form.Group as={Row} className="mb-3" controlId="num_ues">
              <Form.Label column sm={4}>Number of UE Profiles:</Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="number"
                  name="num_ues"
                  value={formData.num_ues}
                  onChange={handleChange}
                  min="1"
                  required
                  disabled={!!selectedProfile} // Disable if updating
                />
              </Col>
            </Form.Group>

            {/* PLMN ID */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>PLMN ID:</Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  name="plmnid.mcc"
                  value={formData.plmnid.mcc}
                  onChange={handleChange}
                  placeholder="MCC"
                  required
                />
              </Col>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  name="plmnid.mnc"
                  value={formData.plmnid.mnc}
                  onChange={handleChange}
                  placeholder="MNC"
                  required
                />
              </Col>
            </Form.Group>

            {/* Configured Slices */}
            <h5 className="mt-4">Configured Slices</h5>
            {formData.ueConfiguredNssai.map((slice, index) => (
              <Form.Group as={Row} className="mb-3" key={index}>
                <Form.Label column sm={2}>Slice {index + 1}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type="number"
                    name={`ueConfiguredNssai.${index}.sst`}
                    value={slice.sst}
                    onChange={(e) => handleArrayChange('ueConfiguredNssai', index, 'sst', parseInt(e.target.value, 10))}
                    placeholder="SST"
                    required
                  />
                </Col>
                <Col sm={4}>
                  <Form.Control
                    type="text"
                    name={`ueConfiguredNssai.${index}.sd`}
                    value={slice.sd}
                    onChange={(e) => handleArrayChange('ueConfiguredNssai', index, 'sd', e.target.value)}
                    placeholder="SD"
                    required
                  />
                </Col>
                <Col sm={2} className="d-flex align-items-center">
                  {formData.ueConfiguredNssai.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeSlice('ueConfiguredNssai', index)}>
                      Remove
                    </Button>
                  )}
                </Col>
              </Form.Group>
            ))}
            <Button variant="secondary" onClick={() => addSlice('ueConfiguredNssai')} className="mb-3">
              Add Configured Slice
            </Button>

            {/* Default Slices */}
            <h5 className="mt-4">Default Slices</h5>
            {formData.ueDefaultNssai.map((slice, index) => (
              <Form.Group as={Row} className="mb-3" key={index}>
                <Form.Label column sm={2}>Slice {index + 1}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type="number"
                    name={`ueDefaultNssai.${index}.sst`}
                    value={slice.sst}
                    onChange={(e) => handleArrayChange('ueDefaultNssai', index, 'sst', parseInt(e.target.value, 10))}
                    placeholder="SST"
                    required
                  />
                </Col>
                <Col sm={4}>
                  <Form.Control
                    type="text"
                    name={`ueDefaultNssai.${index}.sd`}
                    value={slice.sd}
                    onChange={(e) => handleArrayChange('ueDefaultNssai', index, 'sd', e.target.value)}
                    placeholder="SD"
                    required
                  />
                </Col>
                <Col sm={2} className="d-flex align-items-center">
                  {formData.ueDefaultNssai.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeSlice('ueDefaultNssai', index)}>
                      Remove
                    </Button>
                  )}
                </Col>
              </Form.Group>
            ))}
            <Button variant="secondary" onClick={() => addSlice('ueDefaultNssai')} className="mb-3">
              Add Default Slice
            </Button>

            {/* Integrity */}
            <h5 className="mt-4">Integrity</h5>
            <Form.Group as={Row} className="mb-3">
              <Col sm={{ span: 10, offset: 2 }}>
                {['IA1', 'IA2', 'IA3'].map((alg) => (
                  <Form.Check
                    inline
                    key={alg}
                    type="checkbox"
                    label={alg}
                    name={`integrity.${alg}`}
                    checked={formData.integrity[alg]}
                    onChange={handleChange}
                  />
                ))}
              </Col>
            </Form.Group>

            {/* Ciphering */}
            <h5 className="mt-4">Ciphering</h5>
            <Form.Group as={Row} className="mb-3">
              <Col sm={{ span: 10, offset: 2 }}>
                {['EA1', 'EA2', 'EA3'].map((alg) => (
                  <Form.Check
                    inline
                    key={alg}
                    type="checkbox"
                    label={alg}
                    name={`ciphering.${alg}`}
                    checked={formData.ciphering[alg]}
                    onChange={handleChange}
                  />
                ))}
              </Col>
            </Form.Group>

            {/* UAC Access Identities Configuration */}
            <h5 className="mt-4">UAC Access Identities Configuration</h5>
            <Form.Group as={Row} className="mb-3">
              <Col sm={{ span: 10, offset: 2 }}>
                {['mps', 'mcs'].map((field) => (
                  <Form.Check
                    inline
                    key={field}
                    type="checkbox"
                    label={field.toUpperCase()}
                    name={`uacAic.${field}`}
                    checked={formData.uacAic[field]}
                    onChange={handleChange}
                  />
                ))}
              </Col>
            </Form.Group>

            {/* UAC Access Control Class */}
            <h5 className="mt-4">UAC Access Control Class</h5>
            <Form.Group as={Row} className="mb-3" controlId="uacAcc.normalClass">
              <Form.Label column sm={4}>Normal Class:</Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="number"
                  name="uacAcc.normalClass"
                  value={formData.uacAcc.normalClass}
                  onChange={handleChange}
                  placeholder="Enter Normal Class"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Col sm={{ span: 10, offset: 2 }}>
                {['class11', 'class12', 'class13', 'class14', 'class15'].map((cls) => (
                  <Form.Check
                    inline
                    key={cls}
                    type="checkbox"
                    label={cls.toUpperCase()}
                    name={`uacAcc.${cls}`}
                    checked={formData.uacAcc[cls]}
                    onChange={handleChange}
                  />
                ))}
              </Col>
            </Form.Group>

            {/* Submit and Cancel Buttons */}
            <div className="d-flex justify-content-end mt-4">
              <Button variant="success" type="submit" className="me-2">
                {selectedProfile ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

GenerateUEProfileForm.propTypes = {
  selectedProfile: PropTypes.object, 
  onClose: PropTypes.func.isRequired,
  refreshProfiles: PropTypes.func.isRequired,
};

export default GenerateUEProfileForm;
