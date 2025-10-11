'use client';

import * as React from 'react';

import { cn } from '~/lib/utils';
import { useMediaQuery } from '~/hooks/use-media-query';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '~/components/ui/drawer';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Form } from 'react-router';

type OrganizationCreateDialogProps = {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function OrganizationCreateDialog({
  children,
  trigger,
  setOpen,
  open
}: OrganizationCreateDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to manage resources.
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children}
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Add a new organization to manage resources.
          </DrawerDescription>
        </DrawerHeader>
        <OrganizationForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function OrganizationForm({ className }: React.ComponentProps<'form'>) {
  return (
    <Form
      className={cn('grid items-start gap-6', className)}
      method="post"
      replace
    >
      <div className="grid gap-3">
        <Label htmlFor="organization">Organization name</Label>
        <Input
          name="organization"
          type="text"
          id="organization"
          placeholder="Doe Inc."
        />
      </div>
      <Button type="submit" name="_action" value="create_organization">
        Create
      </Button>
    </Form>
  );
}
