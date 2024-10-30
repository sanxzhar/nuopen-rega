"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RequiredSpan from "@/components/ui/label-required";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CrownIcon,
  Loader2,
  PersonStandingIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const MAX_PARTICIPANTS = 3;
const DRIVE_PREFIX = "https://drive.google.com/";
const unis = [
  { label: "NU", value: "nu" },
  { label: "AITU", value: "aitu" },
  // { label: "ENU", value: "enu" },
  { label: "KBTU", value: "kbtu" },
  { label: "SDU", value: "sdu" },
  { label: "School", value: "school" },
  { label: "Other", value: "other" },
] as const;

// const studyYears = ["found", "1", "2", "3", "4", "grad", "school"] as const;
const studyYears = [
  { label: "Foundation year", value: "found" },
  { label: "1st year Bachelor", value: "first" },
  { label: "2nd year Bachelor", value: "second" },
  { label: "3rd year Bachelor", value: "third" },
  { label: "4th year Bachelor", value: "forth" },
  { label: "Graduated Bachelor", value: "grad" },
  { label: "School student", value: "school" },
  { label: "Other", value: "other" },
] as const;

const genders = [
  { label: "Male", value: "m" },
  { label: "Female", value: "f" },
  { label: "Other/Prefer not to say", value: "other" },
];

function getMinAge(online: boolean) {
  return online ? 0 : 16;
}

export function getSchema(online: boolean) {
  const participantSchema = z
    .object({
      name: z.string({ required_error: "Please enter the name" }).min(3),
      surname: z
        .string({ required_error: "Please enter the surname" })
        .min(3)
        .max(40),
      age: z.coerce
        .number({ required_error: "Please enter the age" })
        .min(getMinAge(online))
        .max(40),
      gender: z.z
        .string({
          required_error: "Please select your gender",
        })
        .min(1, { message: "Please select your gender" }),
      email: z
        .string({ required_error: "Please enter the email address" })
        .min(3)
        .email({ message: "Should be in email format. E.g: john@example.com" }),
      uni: z.string().optional(),
      studyYear: z.string().optional(),
      major: z.string().optional(),
      cv: z
        .string()
        .url()
        .startsWith(DRIVE_PREFIX, { message: "Must be a Google Drive Link" })
        .or(z.literal(""))
        .optional(),
      cert: z
        .string()
        .url()
        .startsWith(DRIVE_PREFIX, {
          message: "Must be a Google Drive Link",
        })
        .or(z.literal(""))
        .optional(),
    })
    .refine(
      (data) => {
        if (data.uni) {
          return data.major;
        }
        return true;
      },
      {
        message: "Major is required if University is selected.",
        path: ["major"],
      }
    )
    .refine(
      (data) => {
        if (data.uni) {
          return data.studyYear;
        }

        return true;
      },
      {
        message: "Year of study is required if University is selected.",
        path: ["studyYear"],
      }
    )
    .refine(
      (data) => {
        if (data.uni) {
          return (online || data.cert);
        }

        return true;
      },
      {
        message: "Document is required if University is selected.",
        path: ["cert"],
      }
    );

  const formSchema = z.object({
    teamName: z
      .string({ required_error: "Please enter your team name" })
      .min(2),
    teammates: z.array(participantSchema).min(1).max(MAX_PARTICIPANTS),
    acceptToS: z.literal<boolean>(true),
  });

  return { formSchema, participantSchema };
}

export default function RegistrationForm({ online }: { online: boolean }) {
  const { toast } = useToast();
  const { formSchema, participantSchema } = getSchema(online);
  const [teammatesCount, setTeammatesCount] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [university, setUniversity] = useState("");

  const emptyTeamMember: z.infer<typeof participantSchema> = {
    name: "",
    surname: "",
    age: getMinAge(online),
    gender: "",
    email: "",
    uni: "",
    studyYear: "",
    major: "",
    cv: "",
    cert: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      teammates: [emptyTeamMember],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setSubmitLoading(true);

      const payload = {
        participation_mode: online == true ? "on" : "off",
        team_name: values.teamName,
        captain_name: values.teammates[0].name,
        captain_surname: values.teammates[0].surname,
        captian_email: values.teammates[0].email,
        captain_gender: values.teammates[0].gender,
        captain_age: values.teammates[0].age,
        captain_uni: values.teammates[0].uni,
        captain_year: values.teammates[0].studyYear,
        captain_major: values.teammates[0].major,
        captain_CV: values.teammates[0].cv,
        captain_confirmation: values.teammates[0].cert
          ? values.teammates[0].cert
          : null,
        member2_name: values.teammates[1] ? values.teammates[1].name : null,
        member2_surname: values.teammates[1]
          ? values.teammates[1].surname
          : null,
        member2_email: values.teammates[1] ? values.teammates[1].email : null,
        member2_gender: values.teammates[1] ? values.teammates[1].gender : null,
        member2_age: values.teammates[1] ? values.teammates[1].age : null,
        member2_uni: values.teammates[1] ? values.teammates[1].uni : null,
        member2_year: values.teammates[1]
          ? values.teammates[1].studyYear
          : null,
        member2_major: values.teammates[1] ? values.teammates[1].major : null,
        member2_CV: values.teammates[1] ? values.teammates[1].cv : null,
        member2_confirmation: values.teammates[1]
          ? values.teammates[1].cert
            ? values.teammates[1].cert
            : null
          : null,
        member3_name: values.teammates[2] ? values.teammates[2].name : null,
        member3_surname: values.teammates[2]
          ? values.teammates[2].surname
          : null,
        member3_email: values.teammates[2] ? values.teammates[2].email : null,
        member3_gender: values.teammates[2] ? values.teammates[2].gender : null,
        member3_age: values.teammates[2] ? values.teammates[2].age : null,
        member3_uni: values.teammates[2] ? values.teammates[2].uni : null,
        member3_year: values.teammates[2]
          ? values.teammates[2].studyYear
          : null,
        member3_major: values.teammates[2] ? values.teammates[2].major : null,
        member3_CV: values.teammates[2] ? values.teammates[2].cv : null,
        member3_confirmation: values.teammates[2]
          ? values.teammates[2].cert
            ? values.teammates[2].cert
            : null
          : null,
      };

      console.log(payload);

      const response = await axios.post(
        `https://api.nuacm.kz/api/register/`,
        payload
      );

      // Check if the response status indicates success
      if (response.status >= 200 && response.status < 300) {
        toast({
          variant: "default",
          title: "Success! 🎉",
          description: "Your data has been submitted successfully.",
        });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      let errorMessage = "There was a problem with your request.";
      if (error instanceof AxiosError) {
        if (error && error.message === "Network Error") {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (error.response) {
          if (
            error.response.status === 400 &&
            error.response.data.team_name &&
            error.response.data.team_name[0] ===
              "team with this team name already exists."
          ) {
            errorMessage =
              "The team name you've chosen already exists. Please choose a different name.";
            form.setError("teamName", {
              type: "manual",
              message: errorMessage,
            });
          } else {
            errorMessage = error.response.data.message || errorMessage;
          }
        }
        console.error(error.message);
        // ... other error handling logic
      } else {
        console.error("Unknown error:", error);
      }
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  const { fields, append, remove } = useFieldArray({
    name: "teammates",
    control: form.control,
  });

  // form.getValues

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-bold">
                Team Name
                <RequiredSpan />
              </FormLabel>
              <FormControl>
                <Input placeholder="Abi, I have no idea" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display team name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.map((field, index) => {
          const uniFilled = !!form.getValues(`teammates.${index}.uni`);

          return (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex items-center">
                  {index === 0 ? (
                    <CrownIcon className="w-5 h-5 mr-2" />
                  ) : (
                    <PersonStandingIcon className="w-5 h-5 mr-2" />
                  )}
                  {index === 0 ? `Captain` : `Participant #${index + 1}`}
                </CardTitle>
                <Button
                  size="icon"
                  variant="destructive"
                  disabled={index === 0}
                  onClick={() => {
                    remove(index);
                    setTeammatesCount((prev) => prev - 1);
                  }}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-4 w-full justify-between">
                  <FormField
                    control={form.control}
                    name={`teammates.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Name
                          <RequiredSpan />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`teammates.${index}.surname`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Surname
                          <RequiredSpan />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`teammates.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <RequiredSpan />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.age`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Age
                        <RequiredSpan />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="" inputMode="numeric" {...field} />
                      </FormControl>
                      {!online && (
                        <FormDescription>
                          16+ for Offline participation.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.gender`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <RequiredSpan />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genders.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.uni`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>University/School</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[300px] justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? unis.find((uni) => uni.value === field.value)
                                    ?.label
                                : "Select University/School"}
                              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search uni..." />
                            <CommandEmpty>
                              No University/School found.
                            </CommandEmpty>
                            <CommandGroup>
                              {unis.map((uni) => (
                                <CommandItem
                                  value={uni.label}
                                  key={uni.value}
                                  onSelect={() => {
                                    setUniversity(uni.value);
                                    form.setValue(
                                      `teammates.${index}.uni`,
                                      uni.value
                                    );
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      uni.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {uni.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.studyYear`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Year of study {university && <RequiredSpan />}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year of study" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studyYears.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.major`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Major
                        {university && <RequiredSpan />}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.cv`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CV/Resume Link</FormLabel>
                      <FormControl>
                        <Input placeholder={DRIVE_PREFIX} {...field} />
                      </FormControl>
                      <FormDescription>
                        Upload your CV to be shared with our sponsors for
                        potential employment opportunities.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teammates.${index}.cert`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Document proving study at an educational institution
                        {!online && university && <RequiredSpan />}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={DRIVE_PREFIX} {...field} />
                      </FormControl>
                      {online ? (
                        <FormDescription>
                          Not required for online participation.
                        </FormDescription>
                      ) : (
                        <FormDescription>
                          You can attach enrollment verification with graduation
                          date, official/unofficial transcript or Spravka. Must
                          have a date of September 2024 or later.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          );
        })}

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={teammatesCount === MAX_PARTICIPANTS - 1}
            onClick={() => {
              append(emptyTeamMember);
              setTeammatesCount((prev) => prev + 1);
            }}
          >
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Teammate
          </Button>
          <p className="text-muted-foreground text-xs mt-2">
            Max 3 participants in one team
          </p>
        </div>

        <FormField
          control={form.control}
          name="acceptToS"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I confirm that my team and I consent to our data being shared.
                </FormLabel>
                <FormDescription>
                  We understand that our data may be used for
                  competition-related purposes and will be handled with the
                  utmost care and confidentiality.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitLoading}>
          Submit
          {submitLoading ? (
            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          )}
        </Button>

        {/* <Button
          onClick={() => {
            console.log(form.formState.errors);
          }}
        >
          Test Form State
        </Button> */}
      </form>
    </Form>
  );
}
