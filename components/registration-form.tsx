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
  { label: "ENU", value: "enu" },
  { label: "KBTU", value: "kbtu" },
  { label: "SDU", value: "sdu" },
  { label: "School", value: "school" },
  { label: "Other", value: "other" },
] as const;

// const studyYears = ["found", "1", "2", "3", "4", "grad", "school"] as const;
const studyYears = [
  { label: "Foundation year", value: "found" },
  { label: "1st year Bachelor", value: "1" },
  { label: "2nd year Bachelor", value: "2" },
  { label: "3rd year Bachelor", value: "3" },
  { label: "4th year Bachelor", value: "4" },
  { label: "Graduated Bachelor", value: "grad" },
  { label: "School student", value: "school" },
] as const;

const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other/Prefer not to say", value: "other" },
];

function getMinAge(online: boolean) {
  return online ? 0 : 16;
}

export function getSchema(online: boolean) {
  const participantSchema = z.object({
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
    uni: z
      .string({
        required_error: "Please select your University/School",
      })
      .min(1, { message: "Please select your university" }),
    studyYear: z
      .string({
        required_error: "Please select your year of study",
      })
      .min(1, { message: "Please select your year of study" }),
    cv: z
      .string({ required_error: "CV is required" })
      .min(3)
      .url()
      .startsWith(DRIVE_PREFIX, { message: "Must be a Google Drive Link" }),
    cert: online
      ? z
          .string()
          .url()
          .startsWith(DRIVE_PREFIX, { message: "Must be a Google Drive Link" })
          .optional()
      : z
          .string({ required_error: "This document is required" })
          .min(3)
          .url()
          .startsWith(DRIVE_PREFIX, { message: "Must be a Google Drive Link" }),
  });

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

  const emptyTeamMember: z.infer<typeof participantSchema> = {
    name: "",
    surname: "",
    age: getMinAge(online),
    gender: "",
    email: "",
    uni: "",
    studyYear: "",
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
    setSubmitLoading(true);

    console.log(values);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

    try {
      // TODO: Replace 'your-backend-url' with the actual URL of your backend endpoint
      // const response = await fetch("your-backend-url", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(values),
      //   // TODO: Adapt the values object based on swagger
      // });

      // // Check if the request was successful
      // if (!response.ok) {
      //   throw new Error("Network response was not ok " + response.statusText);
      // }

      // TODO: handle the response from the server
      // const responseData = await response.json();
      // console.log(responseData);

      // You might want to show a success toast here
      toast({
        variant: "default",
        title: "Success! 🎉",
        description: "Your data has been submitted successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  const { fields, append, remove } = useFieldArray({
    name: "teammates",
    control: form.control,
  });

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
                {!online && <RequiredSpan />}
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

        {fields.map((field, index) => (
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
                    <FormLabel>
                      University/School
                      <RequiredSpan />
                    </FormLabel>
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
                      Year of study <RequiredSpan />
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
                name={`teammates.${index}.cv`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      CV/Resume Link
                      <RequiredSpan />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={DRIVE_PREFIX} {...field} />
                    </FormControl>
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
                      {!online && <RequiredSpan />}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={DRIVE_PREFIX} {...field} />
                    </FormControl>
                    {online && (
                      <FormDescription>
                        Not required for online participation
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}

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
