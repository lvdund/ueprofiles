import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { getToken } from '../../utils/auth';
import { Form, Button, Row, Col, Card} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

function UEProfileForm({ selectedProfile, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    supi: '',
    suci: '',
    plmnid: { mcc: '', mnc: '' },
    ueconfiguredNssai: [{ sst: 0, sd: '' }],
    uedefaultNssai: [{ sst: 0, sd: '' }],
    routingIndicator: '',
    homeNetworkPrivateKey: '',
    homeNetworkPublicKey: '',
    homeNetworkPublicKeyId: 0,
    protectionScheme: 0,
    key: '',
    keypair: '', 
    op: '',
    opType: '',
    amf: '',
    imei: '',
    imeisv: '',
    gnbSearchList: [''],
    integrity: { IA1: false, IA2: false, IA3: false },
    ciphering: { EA1: false, EA2: false, EA3: false },
    uacAic: { mps: false, mcs: false },
    uacAcc: {
      normalClass: 0,
      class11: false,
      class12: false,
      class13: false,
      class14: false,
      class15: false,
    },
    sessions: [{ type: '', apn: '', slice: { sst: 0, sd: '' } }],
    integrityMaxRate: { uplink: '', downlink: '' },
  });

  useEffect(() => {
    if (selectedProfile) {
      setFormData(selectedProfile);
    } else {
      setFormData({
        supi: '',
        suci: '',
        plmnid: { mcc: '', mnc: '' },
        ueConfiguredNssai: [{ sst: 0, sd: '' }],
        ueDefaultNssai: [{ sst: 0, sd: '' }],
        routingIndicator: '',
        homeNetworkPrivateKey: '',
        homeNetworkPublicKey: '',
        homeNetworkPublicKeyId: 0,
        protectionScheme: 0,
        key: '',
        keypair: '',
        op: '',
        opType: '',
        amf: '',
        imei: '',
        imeisv: '',
        gnbSearchList: [''],
        integrity: { IA1: false, IA2: false, IA3: false },
        ciphering: { EA1: false, EA2: false, EA3: false },
        uacAic: { mps: false, mcs: false },
        uacAcc: {
          normalClass: 0,
          class11: false,
          class12: false,
          class13: false,
          class14: false,
          class15: false,
        },
        sessions: [{ type: '', apn: '', slice: { sst: 0, sd: '' } }],
        integrityMaxRate: { uplink: '', downlink: '' },
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
        newValue = 0; // Default value hoặc xử lý theo nhu cầu
      }
    }

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    // Handle nested fields
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = checked;
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked,
      });
    }
  };

  const handleArrayChange = (fieldName, index, subFieldName, value) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[fieldName]];
      if (subFieldName) {
        if (typeof updatedArray[index][subFieldName] === 'object') {
          updatedArray[index][subFieldName] = {
            ...updatedArray[index][subFieldName],
            ...value,
          };
        } else {
          updatedArray[index][subFieldName] = value;
        }
      } else {
        updatedArray[index] = value;
      }
      return {
        ...prevData,
        [fieldName]: updatedArray,
      };
    });
  };

  const addArrayItem = (fieldName, defaultItem) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: [...prevData[fieldName], defaultItem],
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[fieldName]];
      updatedArray.splice(index, 1);
      return {
        ...prevData,
        [fieldName]: updatedArray,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      console.log('Submitting formData:', formData);

      if (selectedProfile) {
        // **Xóa SUPI và UserID nếu có trong formData để tránh gửi những trường không thể cập nhật**
        const { supi, userId, ...updateData } = formData;

        // **Kiểm tra các trường bắt buộc**
        if (!updateData.plmnid.mcc || !updateData.plmnid.mnc) {
          toast.error('MCC and MNC of the PLMN ID are compulsory.');
          return;
        }

        // **Update Profile**
        await axios.put(`/ue_profiles/${selectedProfile.supi}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('UE Profile updated successfully.');
        onSubmit();
      } else {
        // **Generate new Profiles**
        await axios.post('/ue_profiles', [formData], {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('UE Profile created successfully.');
        onSubmit();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMsg = error.response?.data?.error || 'An error occurred while saving the UE Profile.';
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>{selectedProfile ? 'Edit UE Profile' : 'Create UE Profile'}</Card.Title>
        <Form onSubmit={handleSubmit}>
          {/* SUPI */}
          <Form.Group as={Row} className="mb-3" controlId="supi">
            <Form.Label column sm={3}>SUPI:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="supi"
                value={formData.supi || ''}
                onChange={handleChange}
                required={!selectedProfile}
                disabled={!!selectedProfile}
                placeholder="Enter SUPI"
              />
            </Col>
          </Form.Group>

          {/* UserID */}
          <Form.Group as={Row} className="mb-3" controlId="userId">
            <Form.Label column sm={3}>UserID:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="userId"
                value={formData.userId || ''}
                onChange={handleChange}
                disabled
                placeholder="UserID (Read-Only)"
              />
            </Col>
          </Form.Group>

          {/* PLMN ID */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>PLMN ID:</Form.Label>
            <Col sm={4}>
              <Form.Control
                type="text"
                name="plmnid.mcc"
                value={formData.plmnid?.mcc || ''}
                onChange={handleChange}
                placeholder="MCC"
                required
              />
            </Col>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="plmnid.mnc"
                value={formData.plmnid?.mnc || ''}
                onChange={handleChange}
                placeholder="MNC"
                required
              />
            </Col>
          </Form.Group>

          {/* Configured Slices */}
          <h5 className="mt-4">Configured Slices</h5>
          {Array.isArray(formData.ueConfiguredNssai) &&
            formData.ueConfiguredNssai.map((slice, index) => (
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
                    <Button variant="danger" size="sm" onClick={() => removeArrayItem('ueConfiguredNssai', index)}>
                      Remove
                    </Button>
                  )}
                </Col>
              </Form.Group>
            ))}
          <Button variant="secondary" onClick={() => addArrayItem('ueConfiguredNssai', { sst: 0, sd: '' })} className="mb-3">
            Add Configured Slice
          </Button>
          
          

          {/* Routing Indicator */}
          <Form.Group as={Row} className="mb-3" controlId="routingIndicator">
            <Form.Label column sm={3}>Routing Indicator:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="routingIndicator"
                value={formData.routingIndicator || ''}
                onChange={handleChange}
                placeholder="Enter Routing Indicator"
              />
            </Col>
          </Form.Group>

          {/* Home Network Private Key */}
          <Form.Group as={Row} className="mb-3" controlId="homeNetworkPrivateKey">
            <Form.Label column sm={3}>Home Network Private Key:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="homeNetworkPrivateKey"
                value={formData.homeNetworkPrivateKey || ''}
                onChange={handleChange}
                placeholder="Enter Home Network Private Key"
              />
            </Col>
          </Form.Group>

          {/* Home Network Public Key */}
          <Form.Group as={Row} className="mb-3" controlId="homeNetworkPublicKey">
            <Form.Label column sm={3}>Home Network Public Key:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="homeNetworkPublicKey"
                value={formData.homeNetworkPublicKey || ''}
                onChange={handleChange}
                placeholder="Enter Home Network Public Key"
              />
            </Col>
          </Form.Group>

          {/* Home Network Public Key ID */}
          <Form.Group as={Row} className="mb-3" controlId="homeNetworkPublicKeyId">
            <Form.Label column sm={3}>Home Network Public Key ID:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="number"
                name="homeNetworkPublicKeyId"
                value={formData.homeNetworkPublicKeyId || 0}
                onChange={handleChange}
                placeholder="Enter Home Network Public Key ID"
              />
            </Col>
          </Form.Group>

          {/* Protection Scheme */}
          <Form.Group as={Row} className="mb-3" controlId="protectionScheme">
            <Form.Label column sm={3}>Protection Scheme:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="number"
                name="protectionScheme"
                value={formData.protectionScheme || 0}
                onChange={handleChange}
                placeholder="Enter Protection Scheme"
              />
            </Col>
          </Form.Group>

          {/* Key */}
          <Form.Group as={Row} className="mb-3" controlId="key">
            <Form.Label column sm={3}>Key:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="key"
                value={formData.key || ''}
                onChange={handleChange}
                placeholder="Enter Key"
              />
            </Col>
          </Form.Group>

          {/* KeyPair */}
          <Form.Group as={Row} className="mb-3" controlId="keypair">
            <Form.Label column sm={3}>KeyPair:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="keypair"
                value={formData.keypair || ''}
                onChange={handleChange}
                placeholder="Enter KeyPair"
              />
            </Col>
          </Form.Group>

          {/* OP */}
          <Form.Group as={Row} className="mb-3" controlId="op">
            <Form.Label column sm={3}>OP:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="op"
                value={formData.op || ''}
                onChange={handleChange}
                placeholder="Enter OP"
              />
            </Col>
          </Form.Group>

          {/* OP Type */}
          <Form.Group as={Row} className="mb-3" controlId="opType">
            <Form.Label column sm={3}>OP Type:</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="opType"
                value={formData.opType || ''}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="OP">OP</option>
                <option value="OPC">OPC</option>
              </Form.Select>
            </Col>
          </Form.Group>

          {/* AMF */}
          <Form.Group as={Row} className="mb-3" controlId="amf">
            <Form.Label column sm={3}>AMF:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="amf"
                value={formData.amf || ''}
                onChange={handleChange}
                placeholder="Enter AMF"
              />
            </Col>
          </Form.Group>

          {/* IMEI */}
          <Form.Group as={Row} className="mb-3" controlId="imei">
            <Form.Label column sm={3}>IMEI:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="imei"
                value={formData.imei || ''}
                onChange={handleChange}
                placeholder="Enter IMEI"
              />
            </Col>
          </Form.Group>

          {/* IMEISV */}
          <Form.Group as={Row} className="mb-3" controlId="imeisv">
            <Form.Label column sm={3}>IMEISV:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="imeisv"
                value={formData.imeisv || ''}
                onChange={handleChange}
                placeholder="Enter IMEISV"
              />
            </Col>
          </Form.Group>

          {/* GNB Search List */}
          <h5 className="mt-4">GNB Search List</h5>
          {formData.gnbSearchList.map((gnb, index) => (
            <Form.Group as={Row} className="mb-3" key={index}>
              <Form.Label column sm={2}>GNB {index + 1}:</Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  name={`gnbSearchList.${index}`}
                  value={gnb}
                  onChange={(e) => handleArrayChange('gnbSearchList', index, null, e.target.value)}
                  placeholder="Enter GNB"
                  required
                />
              </Col>
              <Col sm={2} className="d-flex align-items-center">
                {formData.gnbSearchList.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => removeArrayItem('gnbSearchList', index)}>
                    Remove
                  </Button>
                )}
              </Col>
            </Form.Group>
          ))}
          <Button variant="secondary" onClick={() => addArrayItem('gnbSearchList', '')} className="mb-3">
            Add GNB
          </Button>

          {/* Integrity Algorithms */}
          <h5 className="mt-4">Integrity Algorithms</h5>
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
                  onChange={handleCheckboxChange}
                />
              ))}
            </Col>
          </Form.Group>

          {/* Ciphering Algorithms */}
          <h5 className="mt-4">Ciphering Algorithms</h5>
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
                  onChange={handleCheckboxChange}
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
                  onChange={handleCheckboxChange}
                />
              ))}
            </Col>
          </Form.Group>

          {/* UAC Access Control Class */}
          <h5 className="mt-4">UAC Access Control Class</h5>
          <Form.Group as={Row} className="mb-3" controlId="normalClass">
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

          {/* Sessions */}
          <h5 className="mt-4">Sessions</h5>
          {formData.sessions.map((session, index) => (
            <Card className="mb-3" key={index}>
              <Card.Body>
                <h6>Session {index + 1}</h6>
                <Form.Group as={Row} className="mb-3" controlId={`sessions.${index}.type`}>
                  <Form.Label column sm={2}>Type:</Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      name={`sessions.${index}.type`}
                      value={session.type}
                      onChange={(e) => handleArrayChange('sessions', index, 'type', e.target.value)}
                      placeholder="Enter Type"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId={`sessions.${index}.apn`}>
                  <Form.Label column sm={2}>APN:</Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      name={`sessions.${index}.apn`}
                      value={session.apn}
                      onChange={(e) => handleArrayChange('sessions', index, 'apn', e.target.value)}
                      placeholder="Enter APN"
                      required
                    />
                  </Col>
                </Form.Group>
                {/* Slice within Session */}
                <h6>Slice</h6>
                <Form.Group as={Row} className="mb-3" controlId={`sessions.${index}.slice.sst`}>
                  <Form.Label column sm={2}>SST:</Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="number"
                      name={`sessions.${index}.slice.sst`}
                      value={session.slice.sst}
                      onChange={(e) => handleArrayChange('sessions', index, 'slice.sst', parseInt(e.target.value, 10))}
                      placeholder="Enter SST"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId={`sessions.${index}.slice.sd`}>
                  <Form.Label column sm={2}>SD:</Form.Label>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      name={`sessions.${index}.slice.sd`}
                      value={session.slice.sd}
                      onChange={(e) => handleArrayChange('sessions', index, 'slice.sd', e.target.value)}
                      placeholder="Enter SD"
                      required
                    />
                  </Col>
                </Form.Group>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeArrayItem('sessions', index)}
                >
                  Remove Session
                </Button>
              </Card.Body>
            </Card>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              addArrayItem('sessions', {
                type: '',
                apn: '',
                slice: { sst: 0, sd: '' },
              })
            }
            className="mb-3"
          >
            Add Session
          </Button>

          {/* Integrity Max Rate */}
          <h5 className="mt-4">Integrity Max Rate</h5>
          <Form.Group as={Row} className="mb-3" controlId="integrityMaxRate.uplink">
            <Form.Label column sm={3}>Uplink:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="integrityMaxRate.uplink"
                value={formData.integrityMaxRate.uplink || ''}
                onChange={handleChange}
                placeholder="Enter Uplink Rate"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="integrityMaxRate.downlink">
            <Form.Label column sm={3}>Downlink:</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="integrityMaxRate.downlink"
                value={formData.integrityMaxRate.downlink || ''}
                onChange={handleChange}
                placeholder="Enter Downlink Rate"
              />
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
      </Card.Body>
    </Card>
  );
}

UEProfileForm.propTypes = {
  selectedProfile: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default UEProfileForm;
