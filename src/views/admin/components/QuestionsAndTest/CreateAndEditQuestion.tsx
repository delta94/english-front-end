import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  Form,
  Button,
  CustomInput,
} from "reactstrap";
import { notificationAdd } from "../../utils/Notification";
import {
  EnglishCertificateOptions,
  SkillsTypeOptions,
} from "./CreateAndEditPart";
import {
  NewQuestionInput,
  QuestionType,
  useCreateQuestionMutation,
  SkillsType,
  AnswersInput,
  useGetPartsLazyQuery,
  useGetQuestionLazyQuery,
  useUpdateQuestionMutation,
  MediaType,
  TestQuestionInputId,
  EnglishCertificateType,
} from "../../../../schema/schema";
import Select from "react-select";
import { useFormik } from "formik";
import * as yup from "yup";
import { store } from "react-notifications-component";
import ErrorMessage from "../Error";
import TinyMCETextarea from "../TinyMCETextarea";
import ImageUpload from "../ImageUploader/index";
import config from "../../../../config";
import { QuestionContext } from "./QuestionContext";

interface CreateAndEditQuestionProps {
  modal?: boolean;
  skillType?: SkillsType;
  dataTestQuestionInput?: TestQuestionInputId;
  refetchTestQuestions?: any;
  setIdForced?: (value: number) => void;
}
let PartsOptions = [
  {
    value: "0",
    label: "Chose part",
  },
];
const answersKey: AnswersInput[] = [
  {
    keyAnswer: "A",
    answerContent: "",
  },
  {
    keyAnswer: "B",
    answerContent: "",
  },
  {
    keyAnswer: "C",
    answerContent: "",
  },
  {
    keyAnswer: "D",
    answerContent: "",
  },
];
const CreateAndEditQuestionForm: React.FC<CreateAndEditQuestionProps> = ({
  modal,
  skillType,
  dataTestQuestionInput,
  refetchTestQuestions,
  setIdForced,
}) => {
  

  const answersKeyVcl: AnswersInput[] = [
    {
      keyAnswer: "A",
      answerContent: "",
    },
    {
      keyAnswer: "B",
      answerContent: "",
    },
    {
      keyAnswer: "C",
      answerContent: "",
    },
    {
      keyAnswer: "D",
      answerContent: "",
    },
  ];
  const questionContext = React.useContext(QuestionContext);

  React.useEffect(() => {
    formik.setFieldValue("image", questionContext.path);
  }, [questionContext.path]);
  const { questionId } = useParams();
  const [answersKeyState, setAnswerKeyState] = React.useState(answersKeyVcl);
  let notification = notificationAdd("Question");
  const questionIdFinal = questionId
    ? questionId
    : questionContext.questionIdModal;
  if (questionIdFinal) {
    notification = notificationAdd("Question", "Updated");
  }

  const [certificateTypeSelect, setCertificateTypeSelect] = React.useState(
    EnglishCertificateOptions[0]
  );
  const [skillTypeSelect, setSkillTypeSelect] = React.useState(
    SkillsTypeOptions[0]
  );

  const [partSelect, setPartSelect] = React.useState(PartsOptions[0]);
  const [partsQuery, partsResponse] = useGetPartsLazyQuery();
  const parts = partsResponse.data?.getParts.parts;
  React.useEffect(() => {
    partsQuery({
      variables: {
        data: {
          certificateType: certificateTypeSelect.value as EnglishCertificateType,
        },
      },
    });
    PartsOptions = [
      {
        value: "0",
        label: "Chose part",
      },
    ];
    if (parts) {
      parts
        .filter((part) => part.skillType === skillTypeSelect.value)
        .map((part) => {
          const optionPart = {
            value: part.id,
            label: part.partName,
          };
          PartsOptions = [...PartsOptions, optionPart];
        });
    }
  }, [certificateTypeSelect, skillTypeSelect, parts]);
  let initialValues: NewQuestionInput = {
    questionName: "",
    explaination: "",
    audioSec: 0,
    audioSecVN: 0,
    questionType: QuestionType.SingleChoice,
    content: "",
    answers: answersKey,
    certificateType: questionContext.certificateType,
    skillType: skillType
      ? skillType
      : (SkillsTypeOptions[0].value as SkillsType),
    result: "",
    image: "",
    description: "",
    testId: dataTestQuestionInput?.testId,
    partId: dataTestQuestionInput?.partId,
  };
  const [isCheckedResult, setIsCheckedResult] = React.useState(
    initialValues.result
  );
  const [getQuestionQuery, getQuestionRespone] = useGetQuestionLazyQuery();

  React.useEffect(() => {
    if (!questionIdFinal) {
      return;
    }
    getQuestionQuery({
      variables: {
        id: questionIdFinal,
      },
    });
  }, [questionIdFinal]);
  let urlDefault: string = "";
  let answers: any;
  if (getQuestionRespone.data) {
    const { __typename, ...data } = getQuestionRespone.data.question;
    answers = data.answers.map((answer) => {
      const { __typename, ...answerData } = answer;
      return answerData;
    });
    urlDefault = config.PATH_IMAGE + data.image;

    initialValues = {
      ...data,
      answers,
    };
  }
  React.useEffect(() => {
    if (getQuestionRespone.data) {
      SkillsTypeOptions.find((prop, key) => {
        if (prop.value === initialValues.skillType) {
          setSkillTypeSelect(SkillsTypeOptions[key]);
        }
      });
      EnglishCertificateOptions.find((prop, key) => {
        if (prop.value === initialValues.certificateType) {
          setCertificateTypeSelect(EnglishCertificateOptions[key]);
        }
      });
      setIsCheckedResult(getQuestionRespone.data.question.result);
      setAnswerKeyState(answers);
    }
  }, [getQuestionRespone]);
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [shouldValidate, setShouldValidate] = React.useState(false);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validateOnChange: shouldValidate,
    validateOnBlur: shouldValidate,
    validationSchema: yup.object().shape({
      questionName: yup.string().required("Part Name is a required field"),
      explaination: yup.string().required("Explaination is a required field"),
      certificateType: yup
        .string()
        .required("Certificate Type is a required field"),
      skillType: yup.string().required("Skill Type is a required field"),
      result: yup.string().required("Result is a required field"),
      audioSec: yup.number().required("Audio Seconds must be number"),
    }),
    onSubmit: async (values) => {
      if (questionIdFinal) {
        const result = await updateQuestion({
          variables: {
            data: {
              ...values,
              answers: answersKeyState,
            },
          },
        });
        if (result.data?.updateQuestion) {
          store.addNotification(notification);
          getQuestionRespone.refetch && getQuestionRespone.refetch();
          refetchTestQuestions && refetchTestQuestions();
        }
      } else {
        const result = await createQuestion({
          variables: {
            data: {
              ...values,
              answers: answersKeyState,
            },
          },
        });
        if (result.data?.createQuestion) {
          store.addNotification(notification);
          setIdForced && setIdForced(parseInt(result.data?.createQuestion.id));
          setAnswerKeyState(answersKeyVcl);
          refetchTestQuestions && refetchTestQuestions();
        }
      }
    },
  });

  return (
    <div>
      <Form onSubmit={formik.handleSubmit}>
        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="title">
                  {!questionId ? "Create Question" : "Update Question"}
                </h5>
                <div>
                  <Button
                    type="button"
                    className="bg-info font-weight-bold font-10"
                    onClick={() => {
                      formik.submitForm();
                      setShouldValidate(true);
                    }}
                  >
                    Submit
                  </Button>
                  {!modal && (
                    <Link
                      to={`/admin/toeic/questions`}
                      className="bg-danger btn font-weight-bold font-10"
                    >
                      Cancel
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col className="pr-1" md="6">
                    <FormGroup>
                      <label>Question Name</label>
                      <Input
                        placeholder="Question Name"
                        name="questionName"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.questionName}
                      />
                    </FormGroup>
                    <ErrorMessage message={formik.errors.questionName} />
                  </Col>
                  <Input type="hidden" name="testId" />
                </Row>
                {!modal && (
                  <Row>
                    <Col md="4" className="pr-1">
                      <FormGroup>
                        <label>Type of test</label>
                        <Select
                          className="react-select react-select-primary"
                          onChange={(opt: any) => {
                            setPartSelect(PartsOptions[0]);
                            setCertificateTypeSelect(opt);
                            formik.setFieldValue("certificateType", opt.value);
                          }}
                          value={certificateTypeSelect}
                          classNamePrefix="react-select"
                          placeholder="Chose type of Test"
                          name="certificateType"
                          options={EnglishCertificateOptions}
                        ></Select>
                        <ErrorMessage message={formik.errors.certificateType} />
                      </FormGroup>
                    </Col>
                    <Col md="4" className="pr-1 pl-1">
                      <FormGroup>
                        <label>Skill</label>
                        <Select
                          className="react-select react-select-primary"
                          onChange={(opt: any) => {
                            setPartSelect(PartsOptions[0]);
                            setSkillTypeSelect(opt);
                            formik.setFieldValue("skillType", opt.value);
                          }}
                          classNamePrefix="react-select"
                          placeholder="Single Select"
                          value={skillTypeSelect}
                          name="skillType"
                          options={SkillsTypeOptions}
                        ></Select>
                        <ErrorMessage message={formik.errors.skillType} />
                      </FormGroup>
                    </Col>
                    <Col md="4" className="pl-1">
                      <FormGroup>
                        <label>Part</label>
                        <Select
                          className="react-select react-select-primary"
                          onChange={(opt: any) => {
                            setPartSelect(opt);
                            formik.setFieldValue("partId", opt.value);
                          }}
                          classNamePrefix="react-select"
                          placeholder="Single Select"
                          value={partSelect}
                          name="partId"
                          options={PartsOptions}
                        ></Select>
                        <ErrorMessage message={formik.errors.partId} />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col className="pr-1 " md="6">
                    <FormGroup>
                      <label>Audio Second</label>
                      <Input
                        placeholder="Audio Second"
                        name="audioSec"
                        type="number"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.audioSec}
                      />
                    </FormGroup>
                    <ErrorMessage message={formik.errors.audioSec} />
                  </Col>
                  <Col className="pr-1 " md="6">
                    <FormGroup>
                      <label>Audio Second Vietnam</label>
                      <Input
                        placeholder="Audio Second Vietnam"
                        name="audioSecVN"
                        type="number"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.audioSecVN}
                      />
                    </FormGroup>
                    <ErrorMessage message={formik.errors.audioSecVN} />
                  </Col>
                </Row>
                <Row>
                  <Col className="" md="12">
                    <FormGroup>
                      <label>Content</label>
                      <TinyMCETextarea
                        textareaName="content"
                        onEditorChange={(e: any) => {
                          formik.setFieldValue("content", e);
                        }}
                        value={formik.values.content}
                      />
                    </FormGroup>
                    <ErrorMessage message={formik.errors.content} />
                  </Col>
                </Row>
                <Row>
                  <Col className="" md="12">
                    <FormGroup>
                      <label>Explaination</label>
                      <TinyMCETextarea
                        textareaName="explaination"
                        onEditorChange={(e: any) => {
                          formik.setFieldValue("explaination", e);
                        }}
                        value={formik.values.explaination}
                      />
                    </FormGroup>
                    <ErrorMessage message={formik.errors.explaination} />
                  </Col>
                </Row>

                <Row>
                  <Col className="pr-1" md="6">
                    <FormGroup className="d-flex justify-content-between">
                      <label>Answers Key</label>
                      <label className="position-relative">
                        Result
                        <ErrorMessage
                          style={{
                            position: "absolute",
                            left: "60px",
                            top: "-6px",
                            minWidth: "200px",
                            fontWeight: "normal",
                          }}
                          message={formik.errors.result}
                        />
                      </label>
                    </FormGroup>
                    {answersKeyVcl.map((answer: AnswersInput, index: number) => {
                      return (
                        <FormGroup
                          className="d-flex align-items-center"
                          key={index}
                        >
                          <label className="mr-2">{answer.keyAnswer}</label>
                          <div className="w-100">
                            <Input
                              type="text"
                              onKeyUp={(opt: any) => {
                                const res = answersKeyState.map((a) => {
                                  if (a.keyAnswer === answer.keyAnswer) {
                                    a.answerContent = opt.target.value;
                                  }
                                  return a;
                                });
                                setAnswerKeyState(res);
                                console.log(answersKeyState)
                              }}
                              onBlur={formik.handleBlur}
                              name="answers"
                              defaultValue={
                                formik.values.answers[index].answerContent || ""
                              }
                            />
                            {formik.errors.answers && (
                              <ErrorMessage
                                message={formik.errors.answers[index] as string}
                              />
                            )}
                          </div>
                          <CustomInput
                            type="radio"
                            className="ml-3 mr-3"
                            id={`result${answer.keyAnswer}`}
                            value={answer.keyAnswer!}
                            name="result"
                            checked={answer.keyAnswer === isCheckedResult}
                            onChange={(e) => {
                              formik.handleChange(e);
                              setIsCheckedResult(answer.keyAnswer!);
                            }}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                      );
                    })}
                  </Col>
                  <Col className="pl-1 mt-4" md="6">
                    <Input
                      placeholder="Chose file"
                      name="image"
                      type="hidden"
                    />
                    <ImageUpload
                      type={MediaType.Image}
                      setPath={questionContext.setPath}
                      url={urlDefault}
                      singleImage
                    />
                    <ErrorMessage message={formik.errors.image} />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
const CreateAndEditQuestion: React.FC<CreateAndEditQuestionProps> = ({
  modal,
  skillType,
  dataTestQuestionInput,
  refetchTestQuestions,
}) => {
  const [idForced, setIdForced] = React.useState(0);
  return (
    <div>
      <CreateAndEditQuestionForm
        key={idForced}
        modal={modal}
        skillType={skillType}
        dataTestQuestionInput={dataTestQuestionInput}
        refetchTestQuestions={refetchTestQuestions}
        setIdForced={setIdForced}
      />
    </div>
  );
};

export default CreateAndEditQuestion;
